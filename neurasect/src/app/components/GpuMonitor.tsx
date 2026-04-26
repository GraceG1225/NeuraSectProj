"use client";

import { useEffect, useRef, useState } from "react";

type Gpu = {
  gpu_index: number;
  gpu_name: string;
  gpu_utilization: number;
  memory_used_mb: number;
  memory_total_mb: number;
};

type GpuStats = {
  gpus: Gpu[];
  error?: string;
};

export default function GpuMonitor() {
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<GpuStats>({ gpus: [] });

  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const connect = () => {
    if (!mountedRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket("ws://localhost:8000/ws/gpu");

    ws.onmessage = (event) => {
      try {
        setStats(JSON.parse(event.data) as GpuStats);
      } catch {
      }
    };

    ws.onerror = () => {
      console.log("GPU websocket error");
    };

    ws.onclose = () => {
      wsRef.current = null;
      if (mountedRef.current) {
        retryRef.current = setTimeout(connect, 2000);
      }
    };

    wsRef.current = ws;
  };

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      if (retryRef.current) clearTimeout(retryRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, []);

  const gpus = stats.gpus ?? [];

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">

        {/* button */}
        <button
          onClick={() => setOpen((p) => !p)}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:bg-gray-800"
        >
          GPU Monitor ({gpus.length})
        </button>

        {/* dropdown */}
        {open && (
          <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-xl p-4">

            {stats.error && (
              <p className="text-xs text-red-500 mb-2">
                {stats.error}
              </p>
            )}

            {gpus.length === 0 && !stats.error && (
              <p className="text-sm text-gray-500">
                No GPU data available
              </p>
            )}

            {gpus.map((gpu) => (
              <div key={gpu.gpu_index} className="mb-4 border-b pb-3">

                <p className="text-sm font-bold text-gray-800 mb-2">
                  GPU {gpu.gpu_index}: {gpu.gpu_name}
                </p>

                <div className="space-y-1 text-sm text-gray-700">

                  <div className="flex justify-between">
                    <span>Utilization</span>
                    <span>{gpu.gpu_utilization.toFixed(0)}%</span>
                  </div>

                  <div className="flex justify-between">
                    <span>VRAM Used</span>
                    <span>
                      {gpu.memory_used_mb.toFixed(0)} MB
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Total VRAM</span>
                    <span>
                      {gpu.memory_total_mb.toFixed(0)} MB
                    </span>
                  </div>
                </div>

                {/* bar */}
                <div className="mt-2 h-2 bg-gray-200 rounded">
                  <div
                    className="h-2 bg-blue-600 rounded"
                    style={{ width: `${gpu.gpu_utilization || 0}%` }}
                  />
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}