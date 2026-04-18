from fastapi import FastAPI, HTTPException, UploadFile, File, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tensorflow as tf
from tensorflow import keras
import numpy as np
import pandas as pd
from typing import Optional, List, Dict, Any
from datetime import datetime
import os
from supabase import create_client, Client
from dotenv import load_dotenv
from MLPClass import MLP
from websock.gpu_ws import GPUWebSocketHandler
from websock.training_ws import TrainWebSocketHandler
from websock.upload_ws import UploadHandler

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
training_sessions: Dict[str, Dict[str, Any]] = {}
active_connections: Dict[str, WebSocket] = {}

gpu_handler = GPUWebSocketHandler()
train_ws_handler = TrainWebSocketHandler(training_sessions, active_connections)
upload_handler = UploadHandler(uploaded_datasets)

class TrainingConfig(BaseModel):
    model_config = {"protected_namespaces": ()}

    dataset_id: str
    model_type: str
    data_preprocessing: Optional[str] = "none"
    num_layers: int
    num_neurons: list
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

def get_optimizer(optimizer_name: str, learning_rate: float):
    optimizers_map = {
        "adam": keras.optimizers.Adam(learning_rate=learning_rate),
        "sgd": keras.optimizers.SGD(learning_rate=learning_rate),
        "rmsprop": keras.optimizers.RMSprop(learning_rate=learning_rate),
        "adagrad": keras.optimizers.Adagrad(learning_rate=learning_rate),
        "adamw": keras.optimizers.AdamW(learning_rate=learning_rate),
    }
    return optimizers_map.get(
        optimizer_name.lower(), keras.optimizers.Adam(learning_rate=learning_rate)
    )

def get_regularizer(regularizer_name: str, rate: float):
    if regularizer_name == "l1":
        return keras.regularizers.l1(rate)
    elif regularizer_name == "l2":
        return keras.regularizers.l2(rate)
    elif regularizer_name == "l1_l2":
        return keras.regularizers.l1_l2(l1=rate, l2=rate)
    return None

def build_model(
    input_shape: int,
    output_shape: int,
    num_of_layers: int,
    num_of_neurons_per_layer: list,
    activation: str,
    regularizer: str,
    regularization_rate: float
) -> keras.Model:

    model_instance  = MLP(input_shape=input_shape,output_shape=output_shape,num_of_layers=num_of_layers,num_of_neurons_per_layer=num_of_neurons_per_layer,activation=activation)
    model = model_instance.tf_build()
    return model

def get_model_summary(model: keras.Model) -> str:
    lines = []
    model.summary(print_fn=lambda x: lines.append(x))
    return "\n".join(lines)

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

    print("Dataset not found!")
    raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found. Upload it first.")

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
                except Exception:
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
        except Exception:
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

    X_train, X_test, y_train, y_test = sklearn_split(
        X_scaled, y,
        test_size=1-train_test_split,
        random_state=42
    )
    
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
        "timestamp": datetime.now().isoformat(),
    }

@app.post("/api/upload/dataset")
async def upload_dataset(file: UploadFile = File(...)):
    return await upload_handler.handle(file)

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
            num_of_layers=config.num_layers,
            num_of_neurons_per_layer=config.num_neurons, # has to be a list; verify in config
            activation=config.activation,
            regularizer=config.regularizer,
            regularization_rate=config.regularization_rate
        )
        
        optimizer = get_optimizer(config.optimizer, config.learning_rate)
        
        if num_classes == 1:
            model.compile(
                optimizer=optimizer,
                loss='mse',
                metrics=['mae']
            )
        else:
            model.compile(
                optimizer=optimizer,
                loss='categorical_crossentropy',
                metrics=['accuracy']
            )

        session_id = f"session_{len(training_sessions)}_{datetime.now().timestamp()}"
        training_sessions[session_id] = {
            "model": model,
            "X_train": X_train,
            "X_test": X_test,
            "y_train": y_train,
            "y_test": y_test,
            "config": config,
            "status": "initialized",
            "history": [],
            "num_classes": num_classes
        }

        return TrainingResponse(
            session_id=session_id,
            message="Training session initialized successfully",
            model_summary=get_model_summary(model),
            input_shape=list(X_train.shape),
            output_shape=[num_classes] if num_classes > 1 else [1],
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/train/{session_id}")
async def train_ws(websocket: WebSocket, session_id: str):
    await train_ws_handler.handle(websocket, session_id)

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

@app.websocket("/ws/gpu")
async def gpu_websocket(websocket: WebSocket):
    await gpu_handler.handle(websocket)