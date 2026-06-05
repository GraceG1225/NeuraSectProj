const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/** WebSocket base: http→ws, https→wss (browser Event in onerror often logs as `{}`). */
function apiBaseToWebSocketBase(apiBase: string): string {
  if (apiBase.startsWith('https://')) {
    return `wss://${apiBase.slice('https://'.length)}`;
  }
  if (apiBase.startsWith('http://')) {
    return `ws://${apiBase.slice('http://'.length)}`;
  }
  return apiBase.replace(/^http/, 'ws');
}

export interface TrainingConfig {
  dataset_id: string;
  model_type: string;
  data_preprocessing?: string;
  num_layers: number;
  num_neurons: number;
  learning_rate: number;
  regularization_rate: number;
  train_test_split: number;
  regularizer: string;
  optimizer: string;
  activation: string;
  loss_function: string;
  weight_init: string;
  epochs?: number;
  batch_size?: number;
}

export interface TrainingResponse {
  session_id: string;
  message: string;
  model_summary: string;
  input_shape: number[];
  output_shape: number[];
}

export interface EpochUpdate {
  type: 'epoch_update' | 'training_started' | 'training_complete' | 'error';
  epoch?: number;
  loss?: number;
  accuracy?: number;
  val_loss?: number;
  val_accuracy?: number;
  mae?: number;
  val_mae?: number;
  message?: string;
  final_metrics?: any;
  epochs?: number;
}

export interface UploadResponse {
  dataset_id: string;
  message: string;
  shape: number[];
  num_classes: number;
}

export async function uploadDataset(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/upload/dataset`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to upload dataset');
  }

  const data = await response.json();
  console.log('Dataset uploaded successfully:', data);
  return data;
}

export async function startTraining(config: TrainingConfig): Promise<TrainingResponse> {
  const response = await fetch(`${API_BASE_URL}/api/train/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to start training');
  }
  return response.json();
}

export function connectTrainingWebSocket(
  sessionId: string,
  onMessage: (data: EpochUpdate) => void,
  onError?: (error: Event) => void,
  onClose?: () => void
): WebSocket {
  const wsBase = apiBaseToWebSocketBase(API_BASE_URL);
  const url = `${wsBase}/ws/train/${encodeURIComponent(sessionId)}`;
  const ws = new WebSocket(url);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  ws.onerror = () => {
    console.error(
      'Training WebSocket error (browser hides details). URL:',
      url,
      'readyState:',
      ws.readyState,
      '— Is the API running? e.g. pip install -r src/backend/requirements.txt then uvicorn from src/backend.'
    );
    if (onError) onError(new Event('websocket-error'));
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
    if (onClose) onClose();
  };
  return ws;
}

/** Messages from GET /ws/explain/{sessionId} after the client sends a JSON payload. */
export type ExplainabilityWsMessage =
  | { type: 'explain_started'; m_steps: number }
  | {
      type: 'explain_complete';
      regression: boolean;
      target_class: number | null;
      prediction: number | number[];
      attributions: number[];
      m_steps: number;
    }
  | { type: 'error'; message: string };

export function connectExplainabilityWebSocket(
  sessionId: string,
  onMessage: (data: ExplainabilityWsMessage) => void,
  onError?: (error: Event) => void,
  onClose?: () => void
): WebSocket {
  const wsBase = apiBaseToWebSocketBase(API_BASE_URL);
  const url = `${wsBase}/ws/explain/${encodeURIComponent(sessionId)}`;
  const ws = new WebSocket(url);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data) as ExplainabilityWsMessage;
    onMessage(data);
  };

  ws.onerror = () => {
    console.error(
      'Explainability WebSocket error (browser hides details). URL:',
      url,
      'readyState:',
      ws.readyState,
      '— Start the FastAPI server on the same host/port as NEXT_PUBLIC_API_URL (default :8000).'
    );
    if (onError) onError(new Event('websocket-error'));
  };

  ws.onclose = (ev) => {
    if (ev.code !== 1000) {
      console.warn('Explainability WebSocket closed', 'code:', ev.code, 'reason:', ev.reason || '(none)');
    }
    if (onClose) onClose();
  };

  return ws;
}

export async function getTrainingStatus(sessionId: string) {
  const response = await fetch(`${API_BASE_URL}/api/train/${sessionId}/status`);

  if (!response.ok) {
    throw new Error('Failed to get training status');
  }
  return response.json();
}

export async function makePredictions(sessionId: string, data: number[][]) {
  const response = await fetch(`${API_BASE_URL}/api/train/${sessionId}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to make predictions');
  }
  return response.json();
}

export async function deleteSession(sessionId: string) {
  const response = await fetch(`${API_BASE_URL}/api/train/${sessionId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete session');
  }
  return response.json();
}

export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  return response.json();
}