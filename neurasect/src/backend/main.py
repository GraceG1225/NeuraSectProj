from fastapi import FastAPI, WebSocket, HTTPException, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tensorflow as tf
from tensorflow import keras
import numpy as np
import pandas as pd
from typing import Optional, List, Dict, Any
import json
import asyncio
from datetime import datetime
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import threading
import io

from explainability_ig import integrated_gradients_tabular

load_dotenv()

app = FastAPI(title="NeuraSect Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY", "")

supabase_client: Optional[Client] = None

if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Supabase client initialized")
    except Exception as e:
        print(f"Failed to initialize Supabase: {e}")
        print("Continuing with local datasets only")
else:
    print("Supabase credentials not found in environment")
    print("Only local datasets will be available")

uploaded_datasets: Dict[str, tuple] = {}

class TrainingConfig(BaseModel):
    model_config = {"protected_namespaces": ()}

    dataset_id: str
    model_type: str
    data_preprocessing: Optional[str] = "none"
    num_layers: int
    num_neurons: int
    learning_rate: float
    regularization_rate: float
    train_test_split: float
    regularizer: str
    optimizer: str
    activation: str
    epochs: Optional[int] = 100
    batch_size: Optional[int] = 32

class TrainingResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    
    session_id: str
    message: str
    model_summary: str
    input_shape: List[int]
    output_shape: List[int]

class EpochUpdate(BaseModel):
    epoch: int
    loss: float
    accuracy: float
    val_loss: Optional[float] = None
    val_accuracy: Optional[float] = None

training_sessions: Dict[str, Dict[str, Any]] = {}
active_connections: Dict[str, WebSocket] = {}

def get_optimizer(optimizer_name: str, learning_rate: float):
    optimizers_map = {
        "adam": keras.optimizers.Adam(learning_rate=learning_rate),
        "sgd": keras.optimizers.SGD(learning_rate=learning_rate),
        "rmsprop": keras.optimizers.RMSprop(learning_rate=learning_rate),
        "adagrad": keras.optimizers.Adagrad(learning_rate=learning_rate),
        "adamw": keras.optimizers.AdamW(learning_rate=learning_rate)
    }
    return optimizers_map.get(optimizer_name.lower(), keras.optimizers.Adam(learning_rate=learning_rate))

def get_regularizer(regularizer_name: str, rate: float):
    if regularizer_name == "l1":
        return keras.regularizers.l1(rate)
    elif regularizer_name == "l2":
        return keras.regularizers.l2(rate)
    elif regularizer_name == "l1_l2":
        return keras.regularizers.l1_l2(l1=rate, l2=rate)
    return None

def build_model(input_shape, output_shape, num_layers, num_neurons, activation, regularizer, regularization_rate):
    model = keras.Sequential()
    kernel_reg = get_regularizer(regularizer, regularization_rate) if regularizer not in ["none", "dropout", "batch_norm"] else None

    model.add(keras.layers.Input(shape=(input_shape,)))
    model.add(keras.layers.Dense(num_neurons, activation=activation, kernel_regularizer=kernel_reg))
    if regularizer == "dropout":
        model.add(keras.layers.Dropout(regularization_rate))
    elif regularizer == "batch_norm":
        model.add(keras.layers.BatchNormalization())

    for i in range(num_layers - 1):
        model.add(keras.layers.Dense(num_neurons, activation=activation, kernel_regularizer=kernel_reg))
        if regularizer == "dropout":
            model.add(keras.layers.Dropout(regularization_rate))
        elif regularizer == "batch_norm":
            model.add(keras.layers.BatchNormalization())

    if output_shape == 1:
        model.add(keras.layers.Dense(1))
    else:
        model.add(keras.layers.Dense(output_shape, activation="softmax"))

    return model

def get_model_summary(model: keras.Model) -> str:
    string_list = []
    model.summary(print_fn=lambda x: string_list.append(x))
    return "\n".join(string_list)

def load_dataset(dataset_id: str):
    if dataset_id in uploaded_datasets:
        X, y = uploaded_datasets[dataset_id]
        unique_values = len(np.unique(y))
        print(f"Loaded uploaded dataset: {dataset_id} (shape: {X.shape})")
        return X, y, unique_values if unique_values < 20 else 1
    
    if supabase_client:
        try:
            if len(dataset_id) > 10 and "-" in dataset_id:
                return load_supabase_dataset(dataset_id)
        except Exception as e:
            print(f"Failed to load from Supabase: {e}")

    if dataset_id == "iris":
        from sklearn.datasets import load_iris
        data = load_iris()
        return data.data, data.target, len(np.unique(data.target))
    elif dataset_id == "boston":
        from sklearn.datasets import fetch_california_housing
        data = fetch_california_housing()
        return data.data, data.target, 1

    print(f"Dataset not found!")
    raise HTTPException(
        status_code=404, 
        detail=f"Dataset '{dataset_id}' not found. Upload it first."
    )

def load_supabase_dataset(dataset_id: str):
    if not supabase_client:
        raise HTTPException(status_code=503, detail="Supabase not configured")
    try:
        dataset_response = supabase_client.table("datasets").select("*").eq("id", dataset_id).execute()
        if not dataset_response.data:
            raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found in Supabase")
        dataset_info = dataset_response.data[0]
        dataset_title = dataset_info.get("title", "").lower()
        table_names = ["iris", "boston", "youtube", "insurance", "carsales"]
        table_name = next((t for t in table_names if t in dataset_title), None)
        if not table_name:
            for tname in table_names:
                try:
                    response = supabase_client.table(tname).select("*").eq("dataset_id", dataset_id).execute()
                    if response.data:
                        table_name = tname
                        break
                except:
                    continue
        if not table_name:
            raise HTTPException(status_code=404, detail=f"No data found for dataset '{dataset_id}'")
        data_response = supabase_client.table(table_name).select("*").eq("dataset_id", dataset_id).execute()
        if not data_response.data:
            raise HTTPException(status_code=404, detail=f"No data rows found for dataset '{dataset_id}'")
        df = pd.DataFrame(data_response.data)
        df = df.drop(columns=[c for c in ["id", "dataset_id", "created_at"] if c in df.columns], errors="ignore")
        if len(df.columns) < 2:
            raise HTTPException(status_code=400, detail="Dataset must have at least 2 columns")
        from sklearn.preprocessing import LabelEncoder
        X_df = df.iloc[:, :-1].copy()
        for col in X_df.columns:
            if X_df[col].dtype in ("object", "string"):
                le = LabelEncoder()
                X_df[col] = le.fit_transform(X_df[col].astype(str))
        X = X_df.values.astype(float)
        y = df.iloc[:, -1].values
        try:
            y = pd.to_numeric(y)
        except:
            le = LabelEncoder()
            y = le.fit_transform(y.astype(str))
        unique_values = len(np.unique(y))
        num_classes = unique_values if unique_values < 20 else 1
        print(f"Loaded '{dataset_title}' from Supabase — shape: {X.shape}, classes: {num_classes}")
        return X, y, num_classes
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading dataset: {str(e)}")

def prepare_data(X, y, train_test_split: float):
    from sklearn.model_selection import train_test_split as sklearn_split
    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    X_train, X_test, y_train, y_test = sklearn_split(X_scaled, y, test_size=1 - train_test_split, random_state=42)
    return X_train, X_test, y_train, y_test, scaler

@app.get("/")
async def root():
    return {"message": "NeuraSect Backend API is running", "version": "1.0.0", "status": "healthy"}

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "tensorflow_version": tf.__version__,
        "active_sessions": len(training_sessions),
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/upload/dataset")
async def upload_dataset(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are allowed")
        
        contents = await file.read()
        
        encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252', 'ascii']
        df = None
        used_encoding = None
        
        for encoding in encodings:
            try:
                df = pd.read_csv(io.StringIO(contents.decode(encoding)))
                used_encoding = encoding
                break
            except (UnicodeDecodeError, UnicodeError):
                continue
        
        if df is None:
            raise HTTPException(status_code=400, detail="Could not decode CSV file. Try saving with UTF-8 encoding.")
        
        if df.shape[1] < 2:
            raise HTTPException(status_code=400, detail="Dataset must have at least 2 columns (features + target)")
        
        dataset_id = file.filename.rsplit('.', 1)[0]

        X_df = df.iloc[:, :-1].copy()
        y = df.iloc[:, -1].values

        from sklearn.preprocessing import LabelEncoder
        for col in X_df.columns:
            if X_df[col].dtype in ("object", "string"):
                le = LabelEncoder()
                X_df[col] = le.fit_transform(X_df[col].astype(str))

        try:
            X = X_df.values.astype(float)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Could not convert features to numbers: {str(e)}")
        
        try:
            y = pd.to_numeric(y)
        except:
            print(f"   Converting target column to numeric...")
            le = LabelEncoder()
            y = le.fit_transform(y.astype(str))

        uploaded_datasets[dataset_id] = (X, y)
        
        num_classes = len(np.unique(y))
        
        return {
            "dataset_id": dataset_id,
            "message": f"Dataset uploaded successfully",
            "shape": list(X.shape),
            "num_classes": num_classes
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error processing dataset: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing dataset: {str(e)}")

@app.post("/api/train/start", response_model=TrainingResponse)
async def start_training(config: TrainingConfig):
    try:
        X, y, num_classes = load_dataset(config.dataset_id)
        X_train, X_test, y_train, y_test, scaler = prepare_data(X, y, config.train_test_split)
        if num_classes > 1:
            y_train = keras.utils.to_categorical(y_train, num_classes)
            y_test = keras.utils.to_categorical(y_test, num_classes)
        model = build_model(
            input_shape=X_train.shape[1],
            output_shape=num_classes,
            num_layers=config.num_layers,
            num_neurons=config.num_neurons,
            activation=config.activation,
            regularizer=config.regularizer,
            regularization_rate=config.regularization_rate
        )
        optimizer = get_optimizer(config.optimizer, config.learning_rate)
        if num_classes == 1:
            model.compile(optimizer=optimizer, loss="mse", metrics=["mae"])
        else:
            model.compile(optimizer=optimizer, loss="categorical_crossentropy", metrics=["accuracy"])

        session_id = f"session_{len(training_sessions)}_{datetime.now().timestamp()}"
        training_sessions[session_id] = {
            "model": model,
            "X_train": X_train, "X_test": X_test,
            "y_train": y_train, "y_test": y_test,
            "config": config,
            "status": "initialized",
            "history": [],
            "num_classes": num_classes,
            "scaler": scaler,
        }
        return TrainingResponse(
            session_id=session_id,
            message="Training session initialized successfully",
            model_summary=get_model_summary(model),
            input_shape=list(X_train.shape),
            output_shape=[num_classes] if num_classes > 1 else [1]
        )
    except Exception as e:
        import traceback
        print(f"\nERROR in start_training:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/train/{session_id}")
async def training_websocket(websocket: WebSocket, session_id: str):
    await websocket.accept()

    if session_id not in training_sessions:
        await websocket.send_json({"error": "Invalid session ID"})
        await websocket.close()
        return

    active_connections[session_id] = websocket
    session = training_sessions[session_id]

    try:
        await websocket.send_json({
            "type": "training_started",
            "message": "Training started",
            "epochs": session["config"].epochs
        })

        epoch_queue: asyncio.Queue = asyncio.Queue()

        loop = asyncio.get_event_loop()

        class QueueCallback(keras.callbacks.Callback):
            def on_epoch_end(self, epoch, logs=None):
                logs = logs or {}
                update = {
                    "type": "epoch_update",
                    "epoch": epoch + 1,
                    "loss": float(logs.get("loss", 0)),
                    "val_loss": float(logs.get("val_loss", 0)) if "val_loss" in logs else None,
                }
                if "accuracy" in logs:
                    update["accuracy"] = float(logs.get("accuracy", 0))
                    update["val_accuracy"] = float(logs.get("val_accuracy", 0)) if "val_accuracy" in logs else None
                else:
                    update["mae"] = float(logs.get("mae", 0))
                    update["val_mae"] = float(logs.get("val_mae", 0)) if "val_mae" in logs else None
                loop.call_soon_threadsafe(epoch_queue.put_nowait, update)

        def run_training():
            try:
                history = session["model"].fit(
                    session["X_train"], session["y_train"],
                    validation_data=(session["X_test"], session["y_test"]),
                    epochs=session["config"].epochs,
                    batch_size=session["config"].batch_size,
                    callbacks=[QueueCallback()],
                    verbose=0
                )
                session["history"] = history.history
                session["status"] = "completed"
                loop.call_soon_threadsafe(
                    epoch_queue.put_nowait,
                    {"type": "TRAINING_COMPLETE", "history": history.history}
                )
            except Exception as e:
                loop.call_soon_threadsafe(
                    epoch_queue.put_nowait,
                    {"type": "TRAINING_ERROR", "error": str(e)}
                )
                session["status"] = "error"

        training_thread = threading.Thread(target=run_training, daemon=True)
        training_thread.start()

        while True:
            update = await epoch_queue.get()

            if update.get("type") == "TRAINING_COMPLETE":
                history = update.get("history", {})
                await websocket.send_json({
                    "type": "training_complete",
                    "message": "Training completed successfully",
                    "final_metrics": {
                        "loss": float(history["loss"][-1]) if "loss" in history else None,
                        "val_loss": float(history["val_loss"][-1]) if "val_loss" in history else None,
                        "accuracy": float(history["accuracy"][-1]) if "accuracy" in history else None,
                        "val_accuracy": float(history["val_accuracy"][-1]) if "val_accuracy" in history else None,
                    }
                })
                break
            elif update.get("type") == "TRAINING_ERROR":
                await websocket.send_json({"type": "error", "message": update.get("error")})
                break
            else:
                await websocket.send_json(update)

    except WebSocketDisconnect:
        print(f"WebSocket disconnected for session {session_id}")
        session["status"] = "cancelled"
    except Exception as e:
        print(f"WebSocket error: {e}")
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except:
            pass
    finally:
        active_connections.pop(session_id, None)
        try:
            await websocket.close()
        except:
            pass


@app.websocket("/ws/explain/{session_id}")
async def explainability_websocket(websocket: WebSocket, session_id: str):
    """
    Client connects, then sends one JSON text message:
    {"feature_row": [float, ...], "m_steps": 50}
    Values must be raw features (same scale as the CSV / sklearn dataset), not scaled.
    """
    await websocket.accept()

    if session_id not in training_sessions:
        await websocket.send_json({"type": "error", "message": "Invalid session ID"})
        await websocket.close()
        return

    session = training_sessions[session_id]
    if session.get("status") != "completed":
        await websocket.send_json(
            {"type": "error", "message": "Finish training this session before running explainability."}
        )
        await websocket.close()
        return

    scaler = session.get("scaler")
    if scaler is None:
        await websocket.send_json({"type": "error", "message": "Session has no scaler; start a new training run."})
        await websocket.close()
        return

    try:
        raw = await websocket.receive_text()
        payload = json.loads(raw)
    except Exception as e:
        await websocket.send_json({"type": "error", "message": f"Invalid JSON payload: {e}"})
        await websocket.close()
        return

    feature_row = payload.get("feature_row")
    if feature_row is None and payload.get("features") is not None:
        feature_row = payload.get("features")
    if not isinstance(feature_row, list) or len(feature_row) == 0:
        await websocket.send_json({"type": "error", "message": "Provide feature_row as a non-empty array of numbers."})
        await websocket.close()
        return

    m_steps = int(payload.get("m_steps", 50))
    m_steps = max(5, min(m_steps, 200))

    await websocket.send_json({"type": "explain_started", "m_steps": m_steps})

    result_queue: asyncio.Queue = asyncio.Queue()
    loop = asyncio.get_event_loop()

    def run_explain():
        try:
            x_raw = np.array(feature_row, dtype=np.float32).reshape(1, -1)
            n_features = session["model"].input_shape[-1]
            if x_raw.shape[1] != n_features:
                loop.call_soon_threadsafe(
                    result_queue.put_nowait,
                    {
                        "type": "EXPLAIN_ERROR",
                        "error": f"Expected {n_features} features, got {x_raw.shape[1]}",
                    },
                )
                return

            x_scaled = scaler.transform(x_raw).astype(np.float32)
            model = session["model"]
            num_classes = session["num_classes"]
            pred = model.predict(x_scaled, verbose=0)
            regression = num_classes == 1

            if regression:
                target_idx = 0
                pred_summary = float(pred.reshape(-1)[0])
            else:
                target_idx = int(np.argmax(pred[0]))
                pred_summary = pred[0].tolist()

            x_batch = tf.constant(x_scaled)
            attrs = integrated_gradients_tabular(
                model, x_batch, target_idx, m_steps=m_steps, regression=regression
            )

            loop.call_soon_threadsafe(
                result_queue.put_nowait,
                {
                    "type": "EXPLAIN_COMPLETE",
                    "regression": regression,
                    "target_class": target_idx if not regression else None,
                    "prediction": pred_summary,
                    "attributions": attrs.tolist(),
                    "m_steps": m_steps,
                },
            )
        except Exception as e:
            loop.call_soon_threadsafe(
                result_queue.put_nowait,
                {"type": "EXPLAIN_ERROR", "error": str(e)},
            )

    threading.Thread(target=run_explain, daemon=True).start()

    try:
        update = await result_queue.get()
        if update.get("type") == "EXPLAIN_ERROR":
            await websocket.send_json({"type": "error", "message": update.get("error", "Unknown error")})
        else:
            await websocket.send_json(
                {
                    "type": "explain_complete",
                    "regression": update.get("regression"),
                    "target_class": update.get("target_class"),
                    "prediction": update.get("prediction"),
                    "attributions": update.get("attributions"),
                    "m_steps": update.get("m_steps"),
                }
            )
    except WebSocketDisconnect:
        print(f"Explain WebSocket disconnected for session {session_id}")
    except Exception as e:
        print(f"Explain WebSocket error: {e}")
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
    finally:
        try:
            await websocket.close()
        except Exception:
            pass


@app.get("/api/train/{session_id}/status")
async def get_training_status(session_id: str):
    if session_id not in training_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    session = training_sessions[session_id]
    return {"session_id": session_id, "status": session["status"], "history": session["history"]}

@app.post("/api/train/{session_id}/predict")
async def predict(session_id: str, data: List[List[float]]):
    if session_id not in training_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    session = training_sessions[session_id]
    if session["status"] != "completed":
        raise HTTPException(status_code=400, detail="Model is not trained yet")
    try:
        predictions = session["model"].predict(np.array(data))
        return {"predictions": predictions.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/train/{session_id}")
async def delete_session(session_id: str):
    if session_id not in training_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    del training_sessions[session_id]
    return {"message": f"Session {session_id} deleted successfully"}