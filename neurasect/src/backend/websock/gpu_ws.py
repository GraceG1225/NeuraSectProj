from fastapi import WebSocket, WebSocketDisconnect
import asyncio
import subprocess

class GPUWebSocketHandler:
    async def handle(self, websocket: WebSocket):
        await websocket.accept()
        running = True

        try:
            if not self._has_gpu():
                await websocket.send_json({
                    "gpus": [],
                    "error": "No GPU detected"
                })
                await websocket.receive()
                return

            while running:
                stats = self._get_gpu_metrics()
                await websocket.send_json(stats)
                await asyncio.sleep(1)

        except WebSocketDisconnect:
            pass
        except Exception as e:
            try:
                await websocket.send_json({
                    "error": str(e)
                })
            except:
                pass
        finally:
            running = False
            try:
                await websocket.close()
            except:
                pass

    def _get_gpu_metrics(self):
        try:
            result = subprocess.check_output([
                "nvidia-smi",
                "--query-gpu=index,name,utilization.gpu,memory.used,memory.total",
                "--format=csv,noheader,nounits"
            ]).decode("utf-8").strip()

            gpus = []

            for line in result.splitlines():
                index, name, util, mem_used, mem_total = line.split(",")

                gpus.append({
                    "gpu_index": int(index.strip()),
                    "gpu_name": name.strip(),
                    "gpu_utilization": float(util.strip()),
                    "memory_used_mb": float(mem_used.strip()),
                    "memory_total_mb": float(mem_total.strip())
                })

            return {"gpus": gpus}

        except Exception as e:
            return {
                "gpus": [],
                "error": str(e)
            }

    def _has_gpu(self):
        try:
            subprocess.check_output(["nvidia-smi"], stderr=subprocess.DEVNULL)
            return True
        except Exception:
            return False