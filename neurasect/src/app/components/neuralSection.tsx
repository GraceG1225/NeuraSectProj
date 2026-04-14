"use client";

import { useState, useEffect, useRef } from "react";
import { saveFile, getAllFiles, deleteFile } from "../lib/indexedDBHelpers";
import {
  startTraining,
  connectTrainingWebSocket,
  TrainingConfig,
  EpochUpdate,
} from "../api/trainingApi";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Dataset {
  id: string;
  title: string;
}

interface NeuralSectionProps {
  datasets: Dataset[];
}

export default function NeuralSection({ datasets }: NeuralSectionProps) {
  const [selectedDataset, setSelectedDataset] = useState<string>("iris");
  const [selectedModel, setSelectedModel] = useState<string>("neural_network");
  const [selectedRegularizer, setSelectedRegularizer] = useState<string>("l2");
  const [selectedOptimizer, setSelectedOptimizer] = useState<string>("adam");
  const [activationFunction, setActivationFunction] = useState<string>("relu");

  const [learningRate, setLearningRate] = useState<number>(0.01);
  const [regularizationRate, setRegularizationRate] = useState<number>(0.001);
  const [trainTestSplit, setTrainTestSplit] = useState<number>(0.8);
  const [epochs, setEpochs] = useState<number>(100);

  const [numLayers, setNumLayers] = useState<number>(2);
  const [numNeurons, setNumNeurons] = useState<number>(8);

  const [localDatasets, setLocalDatasets] = useState<any[]>([]);
  const [localModels, setLocalModels] = useState<any[]>([]);

  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainingProgress, setTrainingProgress] = useState<EpochUpdate[]>([]);
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [modelSummary, setModelSummary] = useState<string>("");

  const wsRef = useRef<WebSocket | null>(null);

  const formatNumber = (num: number) => {
    if (num < 0.001) return num.toFixed(4);
    if (num < 0.01) return num.toFixed(3);
    return num.toFixed(2);
  };

  const increment = (setter: (value: number) => void, value: number) =>
    setter(value + 1);
  const decrement = (setter: (value: number) => void, value: number) =>
    setter(Math.max(1, value - 1));

  async function refreshLocalFiles() {
    const ds = await getAllFiles("datasets");
    const ms = await getAllFiles("models");
    setLocalDatasets(ds);
    setLocalModels(ms);
  }

  useEffect(() => {
    refreshLocalFiles();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  async function handleUploadDataset(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      alert("Only .csv datasets allowed.");
      return;
    }

    await saveFile("datasets", file.name, file);
    await refreshLocalFiles();
  }

  async function handleUploadModel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".onnx")) {
      alert("Only .onnx model files allowed.");
      return;
    }

    await saveFile("models", file.name, file);
    await refreshLocalFiles();
  }

  async function handleDeleteDataset(id: string) {
    await deleteFile("datasets", id);
    await refreshLocalFiles();
  }

  async function handleDeleteModel(id: string) {
    await deleteFile("models", id);
    await refreshLocalFiles();
  }

  async function handleStartTraining() {
    if (isTraining) {
      alert("Training is already in progress!");
      return;
    }

    if (!selectedDataset) {
      alert("Please select a dataset first!");
      return;
    }

    try {
      setIsTraining(true);
      setTrainingProgress([]);
      setCurrentEpoch(0);

      const config: TrainingConfig = {
        dataset_id: selectedDataset,
        model_type: selectedModel,
        num_layers: numLayers,
        num_neurons: numNeurons,
        learning_rate: learningRate,
        regularization_rate: regularizationRate,
        train_test_split: trainTestSplit,
        regularizer: selectedRegularizer,
        optimizer: selectedOptimizer,
        activation: activationFunction,
        epochs: epochs,
        batch_size: 32,
      };

      const response = await startTraining(config);
      setSessionId(response.session_id);
      setModelSummary(response.model_summary);

      wsRef.current = connectTrainingWebSocket(
        response.session_id,
        (update: EpochUpdate) => {
          if (update.type === "epoch_update" && update.epoch) {
            setCurrentEpoch(update.epoch);
            setTrainingProgress((prev) => [...prev, update]);
          } else if (update.type === "training_complete") {
            setIsTraining(false);
            alert("Training completed successfully!");
          } else if (update.type === "error") {
            setIsTraining(false);
            alert(`Training error: ${update.message}`);
          }
        },
        (error) => {
          console.error("WebSocket error:", error);
          setIsTraining(false);
        },
        () => {
          setIsTraining(false);
        }
      );
    } catch (error: any) {
      console.error("Training error:", error);
      alert(`Failed to start training: ${error.message}`);
      setIsTraining(false);
    }
  }

  function handleStopTraining() {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsTraining(false);
  }

  const chartData = {
    labels: trainingProgress.map((p) => `Epoch ${p.epoch}`),
    datasets: [
      {
        label: "Training Loss",
        data: trainingProgress.map((p) => p.loss),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
      {
        label: "Validation Loss",
        data: trainingProgress.map((p) => p.val_loss),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Training Progress",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 text-gray-400">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Live Training Dashboard
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Configure your model parameters and watch real-time training progress
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="card p-6 bg-white shadow-md rounded-xl flex flex-col justify-center space-y-10 w-full max-w-5xl">
            {/* upload section */}
            <div className="grid grid-cols-2 gap-6 w-full">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  Upload Dataset (.csv)
                </h3>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleUploadDataset}
                  className="w-full border p-2 rounded-md"
                  disabled={isTraining}
                />
                <div className="mt-2 text-sm text-gray-600">
                  {localDatasets.length > 0 ? (
                    localDatasets.map((d) => (
                      <div
                        key={d.id}
                        className="mt-1 flex justify-between items-center"
                      >
                        <span>{d.id}</span>
                        <button
                          onClick={() => handleDeleteDataset(d.id)}
                          className="text-red-500 text-sm"
                          disabled={isTraining}
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400">No local datasets</div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  Upload Model (.onnx)
                </h3>
                <input
                  type="file"
                  accept=".onnx"
                  onChange={handleUploadModel}
                  className="w-full border p-2 rounded-md"
                  disabled={isTraining}
                />
                <div className="mt-2 text-sm text-gray-600">
                  {localModels.length > 0 ? (
                    localModels.map((m) => (
                      <div
                        key={m.id}
                        className="mt-1 flex justify-between items-center"
                      >
                        <span>{m.id}</span>
                        <button
                          onClick={() => handleDeleteModel(m.id)}
                          className="text-red-500 text-sm"
                          disabled={isTraining}
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400">No local models</div>
                  )}
                </div>
              </div>
            </div>

            {/* dataset and model selection */}
            <div className="grid grid-cols-2 gap-6 w-full">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-2">Dataset</h3>
                <select
                  value={selectedDataset}
                  onChange={(e) => setSelectedDataset(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={isTraining}
                >
                  <option value="">Select Dataset</option>
                  {datasets?.length > 0 &&
                    datasets.map((dataset) => (
                      <option key={dataset.id} value={dataset.id}>
                        {dataset.title}
                      </option>
                    ))}
                  {localDatasets.length > 0 && <option disabled>──────────</option>}
                  {localDatasets.map((d) => (
                    <option key={d.id} value={d.id}>
                      (Local) {d.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 mb-2">Model</h3>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={isTraining}
                >
                  <option value="neural_network">Neural Network</option>
                  <option value="cnn">CNN</option>
                  <option value="rnn">RNN</option>
                  <option value="transformer">Transformer</option>
                  {localModels.length > 0 && <option disabled>──────────</option>}
                  {localModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      (Local) {m.id}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* params */}
            <div className="grid grid-cols-3 gap-6 w-full">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Regularizer</h3>
                <select
                  value={selectedRegularizer}
                  onChange={(e) => setSelectedRegularizer(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={isTraining}
                >
                  <option value="none">None</option>
                  <option value="l1">L1</option>
                  <option value="l2">L2</option>
                  <option value="dropout">Dropout</option>
                  <option value="batch_norm">Batch Norm</option>
                </select>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Optimizer</h3>
                <select
                  value={selectedOptimizer}
                  onChange={(e) => setSelectedOptimizer(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={isTraining}
                >
                  <option value="adam">Adam</option>
                  <option value="sgd">SGD</option>
                  <option value="rmsprop">RMSProp</option>
                  <option value="adagrad">Adagrad</option>
                  <option value="adamw">AdamW</option>
                </select>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Activation</h3>
                <select
                  value={activationFunction}
                  onChange={(e) => setActivationFunction(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={isTraining}
                >
                  <option value="relu">ReLU</option>
                  <option value="sigmoid">Sigmoid</option>
                  <option value="tanh">Tanh</option>
                  <option value="softmax">Softmax</option>
                  <option value="leaky_relu">Leaky ReLU</option>
                  <option value="elu">ELU</option>
                </select>
              </div>
            </div>

            {/* graphs */}
            <div className="flex flex-col lg:flex-row gap-6 justify-center items-center w-full">
              <div className="w-full lg:w-2/3 h-80 bg-gray-100 rounded-lg border-2 border-dashed p-4">
                {trainingProgress.length > 0 ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-lg">
                      Start training to see live progress
                    </p>
                  </div>
                )}
              </div>

              <div className="w-full lg:w-1/3 h-80 bg-gray-100 rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-4">
                {isTraining ? (
                  <>
                    <div className="text-center mb-4">
                      <div className="text-6xl font-bold text-blue-600">
                        {currentEpoch}
                      </div>
                      <div className="text-gray-600">/ {epochs} epochs</div>
                    </div>
                    {trainingProgress.length > 0 && (
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          Loss:{" "}
                          {trainingProgress[trainingProgress.length - 1].loss?.toFixed(
                            4
                          )}
                        </div>
                        {trainingProgress[trainingProgress.length - 1].accuracy && (
                          <div>
                            Accuracy:{" "}
                            {(
                              trainingProgress[trainingProgress.length - 1]
                                .accuracy! * 100
                            ).toFixed(2)}
                            %
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-lg text-center">
                    Click "Start Training" to begin
                  </p>
                )}
              </div>
            </div>

            {/* sliders */}
            <div className="grid grid-cols-3 gap-6 w-full">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Learning Rate</h3>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>0.001</span>
                  <span className="font-bold">{formatNumber(learningRate)}</span>
                  <span>0.1</span>
                </div>
                <input
                  type="range"
                  min="0.001"
                  max="0.1"
                  step="0.001"
                  value={learningRate}
                  onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                  className="w-full accent-blue-600"
                  disabled={isTraining}
                />
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Regularization Rate
                </h3>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>0.0001</span>
                  <span className="font-bold">
                    {formatNumber(regularizationRate)}
                  </span>
                  <span>0.01</span>
                </div>
                <input
                  type="range"
                  min="0.0001"
                  max="0.01"
                  step="0.0001"
                  value={regularizationRate}
                  onChange={(e) =>
                    setRegularizationRate(parseFloat(e.target.value))
                  }
                  className="w-full accent-blue-600"
                  disabled={isTraining}
                />
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Train/Test Split</h3>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>60%</span>
                  <span className="font-bold">
                    {Math.round(trainTestSplit * 100)}%
                  </span>
                  <span>90%</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="0.9"
                  step="0.01"
                  value={trainTestSplit}
                  onChange={(e) => setTrainTestSplit(parseFloat(e.target.value))}
                  className="w-full accent-blue-600"
                  disabled={isTraining}
                />
              </div>
            </div>

            {/* bottom controls */}
            <div className="pt-6 border-t mt-4">
              <div className="flex flex-col lg:flex-row justify-center items-center gap-8">
                <div className="text-center">
                  <h3 className="font-bold text-gray-600 mb-2">Layers</h3>
                  <div className="flex justify-center items-center space-x-3">
                    <button
                      onClick={() => decrement(setNumLayers, numLayers)}
                      className="px-3 py-1 bg-gray-200 rounded-full font-bold disabled:opacity-50"
                      disabled={isTraining}
                    >
                      -
                    </button>
                    <span className="text-lg font-semibold text-gray-600">
                      {numLayers}
                    </span>
                    <button
                      onClick={() => increment(setNumLayers, numLayers)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-full font-bold disabled:opacity-50"
                      disabled={isTraining}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="font-bold text-gray-600 mb-2">Neurons</h3>
                  <div className="flex justify-center items-center space-x-3">
                    <button
                      onClick={() => decrement(setNumNeurons, numNeurons)}
                      className="px-3 py-1 bg-gray-200 rounded-full font-bold disabled:opacity-50"
                      disabled={isTraining}
                    >
                      -
                    </button>
                    <span className="text-lg font-semibold text-gray-600">
                      {numNeurons}
                    </span>
                    <button
                      onClick={() => increment(setNumNeurons, numNeurons)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-full font-bold disabled:opacity-50"
                      disabled={isTraining}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="font-bold text-gray-600 mb-2">Epochs</h3>
                  <input
                    type="number"
                    value={epochs}
                    onChange={(e) => setEpochs(parseInt(e.target.value))}
                    className="w-24 px-3 py-2 border rounded-md text-center"
                    min="1"
                    max="1000"
                    disabled={isTraining}
                  />
                </div>

                <div>
                  {!isTraining ? (
                    <button
                      onClick={handleStartTraining}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                    >
                      Start Training
                    </button>
                  ) : (
                    <button
                      onClick={handleStopTraining}
                      className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                    >
                      Stop Training
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* model summary */}
            {modelSummary && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">Model Architecture</h3>
                <pre className="text-xs text-gray-700 overflow-x-auto">
                  {modelSummary}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}