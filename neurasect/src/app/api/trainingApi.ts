const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface TrainingConfig {
  dataset_id: string;
  model_type: string;
  num_layers: number;
  num_neurons: number;
  learning_rate: number;
  regularization_rate: number;
  train_test_split: number;
  regularizer: string;
  optimizer: string;
  activation: string;
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
  const wsUrl = API_BASE_URL.replace('http', 'ws');
  const ws = new WebSocket(`${wsUrl}/ws/train/${sessionId}`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    if (onError) onError(error);
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
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