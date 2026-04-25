from fastapi import WebSocket, WebSocketDisconnect
from tensorflow import keras
import asyncio
import threading

class TrainWebSocketHandler:
    def __init__(self, training_sessions: dict, active_connections: dict):
        self.training_sessions = training_sessions
        self.active_connections = active_connections

    async def handle(self, websocket: WebSocket, session_id: str):
        await websocket.accept()

        if session_id not in self.training_sessions:
            await websocket.send_json({"error": "Invalid session ID"})
            await websocket.close()
            return

        self.active_connections[session_id] = websocket
        session = self.training_sessions[session_id]

        try:
            await websocket.send_json({
                "type": "training_started",
                "message": "Training started",
                "epochs": session["config"].epochs,
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
                        update["val_accuracy"] = (
                            float(logs.get("val_accuracy", 0))
                            if "val_accuracy" in logs
                            else None
                        )
                    else:
                        update["mae"] = float(logs.get("mae", 0))
                        update["val_mae"] = (
                            float(logs.get("val_mae", 0))
                            if "val_mae" in logs
                            else None
                        )

                    if (epoch + 1) % 5 == 0:
                        layers = []
                        weights = []

                        dense_layers = [layer for layer in self.model.layers if hasattr(layer, "units")]

                        for layer in dense_layers:
                            layers.append(layer.units)

                        for layer in dense_layers:
                            kernel = layer.get_weights()[0]
                            weights.append(kernel.tolist())
                        update["layers"] = layers
                        update["weights"] = weights

                    loop.call_soon_threadsafe(epoch_queue.put_nowait, update)

            def run_training():
                try:
                    history = session["model"].fit(
                        session["X_train"],
                        session["y_train"],
                        validation_data=(session["X_test"], session["y_test"]),
                        epochs=session["config"].epochs,
                        batch_size=session["config"].batch_size,
                        callbacks=[QueueCallback()],
                        verbose=0,
                    )
                    session["history"] = history.history
                    session["status"] = "completed"
                    loop.call_soon_threadsafe(
                        epoch_queue.put_nowait,
                        {"type": "TRAINING_COMPLETE", "history": history.history},
                    )
                except Exception as e:
                    loop.call_soon_threadsafe(
                        epoch_queue.put_nowait,
                        {"type": "TRAINING_ERROR", "error": str(e)},
                    )
                    session["status"] = "error"

            threading.Thread(target=run_training, daemon=True).start()

            while True:
                update = await epoch_queue.get()

                if update.get("type") == "TRAINING_COMPLETE":
                    history = update.get("history", {})
                    is_regression = "mae" in history

                    if is_regression:
                        final_metrics = {
                            "loss": float(history["loss"][-1]) if "loss" in history else None,
                            "val_loss": float(history["val_loss"][-1]) if "val_loss" in history else None,
                            "mae": float(history["mae"][-1]) if "mae" in history else None,
                            "val_mae": float(history["val_mae"][-1]) if "val_mae" in history else None,
                        }
                    else:
                        final_metrics = {
                            "loss": float(history["loss"][-1]) if "loss" in history else None,
                            "val_loss": float(history["val_loss"][-1]) if "val_loss" in history else None,
                            "accuracy": float(history["accuracy"][-1]) if "accuracy" in history else None,
                            "val_accuracy": float(history["val_accuracy"][-1]) if "val_accuracy" in history else None,
                        }

                    await websocket.send_json({
                        "type": "training_complete",
                        "message": "Training completed successfully",
                        "final_metrics": final_metrics,
                    })
                    break

                elif update.get("type") == "TRAINING_ERROR":
                    await websocket.send_json({
                        "type": "error",
                        "message": update.get("error"),
                    })
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
            except Exception:
                pass
        finally:
            self.active_connections.pop(session_id, None)
            try:
                await websocket.close()
            except Exception:
                pass