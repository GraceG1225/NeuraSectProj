from fastapi import FastAPI, WebSocket, HTTPException, WebSocketDisconnect
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

load_dotenv()

app = FastAPI(title="NeuraSect Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

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

class TrainingConfig(BaseModel):
    model_config = {"protected_namespaces": ()}
    
    dataset_id: str
    model_type: str
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
        'adam': keras.optimizers.Adam(learning_rate=learning_rate),
        'sgd': keras.optimizers.SGD(learning_rate=learning_rate),
        'rmsprop': keras.optimizers.RMSprop(learning_rate=learning_rate),
        'adagrad': keras.optimizers.Adagrad(learning_rate=learning_rate),
        'adamw': keras.optimizers.AdamW(learning_rate=learning_rate)
    }
    return optimizers_map.get(optimizer_name.lower(), keras.optimizers.Adam(learning_rate=learning_rate))

def get_regularizer(regularizer_name: str, rate: float):
    if regularizer_name == 'l1':
        return keras.regularizers.l1(rate)
    elif regularizer_name == 'l2':
        return keras.regularizers.l2(rate)
    elif regularizer_name == 'l1_l2':
        return keras.regularizers.l1_l2(l1=rate, l2=rate)
    return None

def build_model(
    input_shape: int,
    output_shape: int,
    num_layers: int,
    num_neurons: int,
    activation: str,
    regularizer: str,
    regularization_rate: float
) -> keras.Model:
    
    model = keras.Sequential()
    
    kernel_reg = get_regularizer(regularizer, regularization_rate) if regularizer not in ['none', 'dropout', 'batch_norm'] else None
    
    model.add(keras.layers.Dense(
        num_neurons,
        activation=activation,
        kernel_regularizer=kernel_reg,
        input_shape=(input_shape,)
    ))

    if regularizer == 'dropout':
        model.add(keras.layers.Dropout(regularization_rate))
    elif regularizer == 'batch_norm':
        model.add(keras.layers.BatchNormalization())

    for i in range(num_layers - 1):
        model.add(keras.layers.Dense(
            num_neurons,
            activation=activation,
            kernel_regularizer=kernel_reg
        ))
        
        if regularizer == 'dropout':
            model.add(keras.layers.Dropout(regularization_rate))
        elif regularizer == 'batch_norm':
            model.add(keras.layers.BatchNormalization())
    
    if output_shape == 1:
        model.add(keras.layers.Dense(1))
    else:
        model.add(keras.layers.Dense(output_shape, activation='softmax'))
    
    return model

def get_model_summary(model: keras.Model) -> str:
    string_list = []
    model.summary(print_fn=lambda x: string_list.append(x))
    return "\n".join(string_list)

def load_dataset(dataset_id: str):
    
    if supabase_client:
        try:
            if len(dataset_id) > 10 and '-' in dataset_id:
                return load_supabase_dataset(dataset_id)
        except Exception as e:
            print(f"Failed to load from Supabase: {e}")
    
    if dataset_id == 'iris':
        from sklearn.datasets import load_iris
        data = load_iris()
        X = data.data
        y = data.target
        return X, y, len(np.unique(y))
    
    elif dataset_id == 'boston':
        from sklearn.datasets import fetch_california_housing
        data = fetch_california_housing()
        X = data.data
        y = data.target
        return X, y, 1 
    
    csv_path = f"./datasets/{dataset_id}.csv"
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        X = df.iloc[:, :-1].values
        y = df.iloc[:, -1].values
        
        unique_values = len(np.unique(y))
        if unique_values < 20:
            return X, y, unique_values
        else: 
            return X, y, 1
    
    raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found")


def load_supabase_dataset(dataset_id: str):
    if not supabase_client:
        raise HTTPException(status_code=503, detail="Supabase not configured")
    
    try:
        dataset_response = supabase_client.table('datasets').select('*').eq('id', dataset_id).execute()
        
        if not dataset_response.data or len(dataset_response.data) == 0:
            raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found in Supabase")
        
        dataset_info = dataset_response.data[0]
        dataset_title = dataset_info.get('title', '').lower()
        
        table_names = ['iris', 'boston', 'youtube', 'insurance', 'carsales']
        
        table_name = None
        for tname in table_names:
            if tname in dataset_title:
                table_name = tname
                break
        
        if not table_name:
            for tname in table_names:
                try:
                    response = supabase_client.table(tname).select('*').eq('dataset_id', dataset_id).execute()
                    if response.data and len(response.data) > 0:
                        table_name = tname
                        break
                except:
                    continue
        
        if not table_name:
            raise HTTPException(
                status_code=404, 
                detail=f"No data found for dataset '{dataset_id}'. Make sure the dataset has associated table data."
            )
        
        data_response = supabase_client.table(table_name).select('*').eq('dataset_id', dataset_id).execute()
        
        if not data_response.data or len(data_response.data) == 0:
            raise HTTPException(status_code=404, detail=f"No data rows found for dataset '{dataset_id}'")
        
        df = pd.DataFrame(data_response.data)

        columns_to_drop = ['id', 'dataset_id', 'created_at']
        df = df.drop(columns=[col for col in columns_to_drop if col in df.columns], errors='ignore')
        
        if len(df.columns) < 2:
            raise HTTPException(status_code=400, detail="Dataset must have at least 2 columns (features + target)")
        
        X = df.iloc[:, :-1].values
        y = df.iloc[:, -1].values
        
        try:
            y = pd.to_numeric(y)
        except:
            from sklearn.preprocessing import LabelEncoder
            le = LabelEncoder()
            y = le.fit_transform(y)
        
        X = X.astype(float)

        unique_values = len(np.unique(y))
        if unique_values < 20:  
            num_classes = unique_values
        else: 
            num_classes = 1
        
        print(f"Loaded dataset '{dataset_title}' from Supabase")
        print(f"   Shape: {X.shape}, Classes: {num_classes}")
        
        return X, y, num_classes
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error loading Supabase dataset: {e}")
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
    return {
        "message": "NeuraSect Backend API is running",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "tensorflow_version": tf.__version__,
        "active_sessions": len(training_sessions),
        "timestamp": datetime.now().isoformat()
    }

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
            output_shape=[num_classes] if num_classes > 1 else [1]
        )
        
    except Exception as e:
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
        class WebSocketCallback(keras.callbacks.Callback):
            def __init__(self, ws: WebSocket):
                super().__init__()
                self.ws = ws
                
            def on_epoch_end(self, epoch, logs=None):
                logs = logs or {}
                update = {
                    "type": "epoch_update",
                    "epoch": epoch + 1,
                    "loss": float(logs.get('loss', 0)),
                    "val_loss": float(logs.get('val_loss', 0)) if 'val_loss' in logs else None,
                }
                
                if 'accuracy' in logs:
                    update['accuracy'] = float(logs.get('accuracy', 0))
                    update['val_accuracy'] = float(logs.get('val_accuracy', 0)) if 'val_accuracy' in logs else None
                else:
                    update['mae'] = float(logs.get('mae', 0))
                    update['val_mae'] = float(logs.get('val_mae', 0)) if 'val_mae' in logs else None
                
                asyncio.create_task(self.ws.send_json(update))
        
        await websocket.send_json({
            "type": "training_started",
            "message": "Training started",
            "epochs": session['config'].epochs
        })
        
        session['status'] = 'training'
        history = session['model'].fit(
            session['X_train'],
            session['y_train'],
            validation_data=(session['X_test'], session['y_test']),
            epochs=session['config'].epochs,
            batch_size=session['config'].batch_size,
            callbacks=[WebSocketCallback(websocket)],
            verbose=0
        )
        
        session['status'] = 'completed'
        session['history'] = history.history
        
        await websocket.send_json({
            "type": "training_complete",
            "message": "Training completed successfully",
            "final_metrics": {
                "loss": float(history.history['loss'][-1]),
                "val_loss": float(history.history['val_loss'][-1]) if 'val_loss' in history.history else None,
                "accuracy": float(history.history.get('accuracy', [0])[-1]) if 'accuracy' in history.history else None,
                "val_accuracy": float(history.history.get('val_accuracy', [0])[-1]) if 'val_accuracy' in history.history else None
            }
        })
        
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for session {session_id}")
        session['status'] = 'cancelled'
    except Exception as e:
        await websocket.send_json({
            "type": "error",
            "message": str(e)
        })
        session['status'] = 'error'
    finally:
        if session_id in active_connections:
            del active_connections[session_id]

@app.get("/api/train/{session_id}/status")
async def get_training_status(session_id: str):
    if session_id not in training_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = training_sessions[session_id]
    return {
        "session_id": session_id,
        "status": session['status'],
        "history": session['history']
    }

@app.post("/api/train/{session_id}/predict")
async def predict(session_id: str, data: List[List[float]]):
    if session_id not in training_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = training_sessions[session_id]
    
    if session['status'] != 'completed':
        raise HTTPException(status_code=400, detail="Model is not trained yet")
    
    try:
        X = np.array(data)
        predictions = session['model'].predict(X)
        
        return {
            "predictions": predictions.tolist()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/train/{session_id}")
async def delete_session(session_id: str):
    if session_id not in training_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    del training_sessions[session_id]
    
    return {"message": f"Session {session_id} deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    
    print("Starting NeuraSect Backend API...")
    print("TensorFlow loaded successfully")
    print("Server will be available at: http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    print("=" * 60)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )