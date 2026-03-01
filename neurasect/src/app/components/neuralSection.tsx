"use client";

import { useState, useEffect, useRef } from "react";
import { saveFile, getAllFiles, deleteFile } from "../lib/indexedDBHelpers";
import { startTraining, connectTrainingWebSocket, TrainingConfig, EpochUpdate } from "../api/trainingApi";
import { AccuracyChart } from "./accuracyChart";

interface Dataset {
  id: string;
  title: string;
}

interface NeuralSectionProps {
  datasets: Dataset[];
}

export default function NeuralSection({ datasets }: NeuralSectionProps) {
  const [activeTab, setActiveTab] = useState<"config" | "training">("config");

  const [modelConfig, setModelConfig] = useState({
    selectedDataset: "iris",
    selectedModel: "neural_network",
    selectedDataPreprocessing: "none",
    selectedRegularizer: "l2",
    selectedOptimizer: "adam",
    activationFunction: "relu",
  });

  const [hyperparameters, setHyperparameters] = useState({
    learningRate: 0.01,
    regularizationRate: 0.001,
    trainTestSplit: 0.8,
    epochs: 100,
    numLayers: 2,
    numNeurons: 8,
  });

  const [localFiles, setLocalFiles] = useState({
    datasets: [] as any[],
    models: [] as any[],
  });

  const [trainingState, setTrainingState] = useState({
    isTraining: false,
    sessionId: null as string | null,
    currentEpoch: 0,
    trainingProgress: [] as EpochUpdate[],
    modelSummary: "",
  });

  const wsRef = useRef<WebSocket | null>(null);

  const formatNumber = (num: number) => {
    if (num < 0.001) return num.toFixed(4);
    if (num < 0.01) return num.toFixed(3);
    return num.toFixed(2);
  };

  const increment = (value: number) => value + 1;
  const decrement = (value: number) => Math.max(1, value - 1);

  async function refreshLocalFiles() {
    const ds = await getAllFiles("datasets");
    const ms = await getAllFiles("models");
    setLocalFiles({ datasets: ds, models: ms });
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
    if (trainingState.isTraining) {
      alert("Training is already in progress!");
      return;
    }
    if (!modelConfig.selectedDataset) {
      alert("Please select a dataset first!");
      return;
    }

    try {
      setTrainingState((prev) => ({
        ...prev,
        isTraining: true,
        trainingProgress: [],
        currentEpoch: 0,
      }));

      const config: TrainingConfig = {
        dataset_id: modelConfig.selectedDataset,
        model_type: modelConfig.selectedModel,
        data_preprocessing: modelConfig.selectedDataPreprocessing,
        num_layers: hyperparameters.numLayers,
        num_neurons: hyperparameters.numNeurons,
        learning_rate: hyperparameters.learningRate,
        regularization_rate: hyperparameters.regularizationRate,
        train_test_split: hyperparameters.trainTestSplit,
        regularizer: modelConfig.selectedRegularizer,
        optimizer: modelConfig.selectedOptimizer,
        activation: modelConfig.activationFunction,
        epochs: hyperparameters.epochs,
        batch_size: 32,
      };

      const response = await startTraining(config);
      setTrainingState((prev) => ({
        ...prev,
        sessionId: response.session_id,
        modelSummary: response.model_summary,
      }));

      setActiveTab("training");

      wsRef.current = connectTrainingWebSocket(
        response.session_id,
        (update: EpochUpdate) => {
          if (update.type === "epoch_update" && update.epoch !== undefined) {
            setTrainingState((prev) => ({
              ...prev,
              currentEpoch: update.epoch as number,
              trainingProgress: [...prev.trainingProgress, update],
            }));
          } else if (update.type === "training_complete") {
            setTrainingState((prev) => ({
              ...prev,
              isTraining: false,
            }));
            alert("Training completed successfully!");
          } else if (update.type === "error") {
            setTrainingState((prev) => ({
              ...prev,
              isTraining: false,
            }));
            alert(`Training error: ${update.message}`);
          }
        },
        (error) => {
          console.error("WebSocket error:", error);
          setTrainingState((prev) => ({ ...prev, isTraining: false }));
        },
        () => {
          setTrainingState((prev) => ({ ...prev, isTraining: false }));
        }
      );
    } catch (error: any) {
      console.error("Training error:", error);
      alert(`Failed to start training: ${error.message}`);
      setTrainingState((prev) => ({ ...prev, isTraining: false }));
    }
  }

  function handleStopTraining() {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setTrainingState((prev) => ({ ...prev, isTraining: false }));
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Live Training Dashboard
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Configure your model parameters and watch real-time training progress
          </p>
        </div>

        <div className="w-full max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* tab navigation */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("config")}
                className={`flex-1 px-6 py-4 font-semibold text-sm transition-colors ${
                  activeTab === "config"
                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Configuration
              </button>
              <button
                onClick={() => setActiveTab("training")}
                className={`flex-1 px-6 py-4 font-semibold text-sm transition-colors relative ${
                  activeTab === "training"
                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Training Progress
                {trainingState.isTraining && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                )}
              </button>
            </div>

            {/* tabs */}
            <div className="p-8">
              {/* config tab */}
              {activeTab === "config" && (
                <div className="space-y-8">
                  {/* dataset section */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">1</span>
                      Dataset Configuration
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Dataset</label>
                        <select
                          value={modelConfig.selectedDataset}
                          onChange={(e) =>
                            setModelConfig((prev) => ({ ...prev, selectedDataset: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                          disabled={trainingState.isTraining}
                        >
                          <option value="">Select Dataset</option>
                          {datasets?.length > 0 &&
                            datasets.map((dataset) => (
                              <option key={dataset.id} value={dataset.id}>
                                {dataset.title}
                              </option>
                            ))}
                          {localFiles.datasets.length > 0 && (
                            <option disabled>──────────</option>
                          )}
                          {localFiles.datasets.map((d) => (
                            <option key={d.id} value={d.id}>
                              (Local) {d.id}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Dataset (.csv)</label>
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleUploadDataset}
                          className="w-full text-sm text-gray-500"
                          disabled={trainingState.isTraining}
                        />
                      </div>
                    </div>

                    {localFiles.datasets.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {localFiles.datasets.map((d) => (
                          <div key={d.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm text-gray-700">{d.id}</span>
                            <button
                              onClick={() => handleDeleteDataset(d.id)}
                              className="text-red-500 hover:text-red-700 text-sm font-semibold"
                              disabled={trainingState.isTraining}
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-6 mt-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Data Preprocessing</label>
                        <select
                          value={modelConfig.selectedDataPreprocessing}
                          onChange={(e) =>
                            setModelConfig((prev) => ({ ...prev, selectedDataPreprocessing: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                          disabled={trainingState.isTraining}
                        >
                          <option value="none">None</option>
                          <option value="standardize">Standardize</option>
                          <option value="normalize">Normalize</option>
                          <option value="minmax">Min-Max Scale</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Train/Test Split</label>
                        <div className="flex justify-between text-xs text-gray-600 mb-2">
                          <span>60%</span>
                          <span className="font-semibold text-gray-900">{Math.round(hyperparameters.trainTestSplit * 100)}%</span>
                          <span>90%</span>
                        </div>
                        <input
                          type="range"
                          min="0.6"
                          max="0.9"
                          step="0.01"
                          value={hyperparameters.trainTestSplit}
                          onChange={(e) =>
                            setHyperparameters((prev) => ({ ...prev, trainTestSplit: parseFloat(e.target.value) }))
                          }
                          className="w-full accent-blue-600"
                          disabled={trainingState.isTraining}
                        />
                      </div>
                    </div>
                  </div>

                  {/* model section */}
                  <div className="border-t pt-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-semibold">2</span>
                      Model Architecture
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Model Type</label>
                        <select
                          value={modelConfig.selectedModel}
                          onChange={(e) =>
                            setModelConfig((prev) => ({ ...prev, selectedModel: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                          disabled={trainingState.isTraining}
                        >
                          <option value="neural_network">Neural Network</option>
                          <option value="cnn">CNN</option>
                          <option value="rnn">RNN</option>
                          <option value="transformer">Transformer</option>
                          {localFiles.models.length > 0 && (
                            <option disabled>──────────</option>
                          )}
                          {localFiles.models.map((m) => (
                            <option key={m.id} value={m.id}>
                              (Local) {m.id}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Model (.onnx)</label>
                        <input
                          type="file"
                          accept=".onnx"
                          onChange={handleUploadModel}
                          className="w-full text-sm text-gray-500"
                          disabled={trainingState.isTraining}
                        />
                      </div>
                    </div>

                    {localFiles.models.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {localFiles.models.map((m) => (
                          <div key={m.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm text-gray-700">{m.id}</span>
                            <button
                              onClick={() => handleDeleteModel(m.id)}
                              className="text-red-500 hover:text-red-700 text-sm font-semibold"
                              disabled={trainingState.isTraining}
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-4 gap-4 mt-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Layers</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setHyperparameters((prev) => ({ ...prev, numLayers: decrement(prev.numLayers) }))
                            }
                            className="flex-1 px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-semibold text-gray-900"
                            disabled={trainingState.isTraining}
                          >
                            &minus;
                          </button>
                          <span className="flex-1 text-center font-semibold text-gray-700">{hyperparameters.numLayers}</span>
                          <button
                            onClick={() =>
                              setHyperparameters((prev) => ({ ...prev, numLayers: increment(prev.numLayers) }))
                            }
                            className="flex-1 px-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold"
                            disabled={trainingState.isTraining}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Neurons</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setHyperparameters((prev) => ({ ...prev, numNeurons: decrement(prev.numNeurons) }))
                            }
                            className="flex-1 px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-semibol text-gray-900"
                            disabled={trainingState.isTraining}
                          >
                            &minus;
                          </button>
                          <span className="flex-1 text-center font-semibold text-gray-700">{hyperparameters.numNeurons}</span>
                          <button
                            onClick={() =>
                              setHyperparameters((prev) => ({ ...prev, numNeurons: increment(prev.numNeurons) }))
                            }
                            className="flex-1 px-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold"
                            disabled={trainingState.isTraining}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Activation</label>
                        <select
                          value={modelConfig.activationFunction}
                          onChange={(e) =>
                            setModelConfig((prev) => ({ ...prev, activationFunction: e.target.value }))
                          }
                          className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                          disabled={trainingState.isTraining}
                        >
                          <option value="relu">ReLU</option>
                          <option value="sigmoid">Sigmoid</option>
                          <option value="tanh">Tanh</option>
                          <option value="softmax">Softmax</option>
                          <option value="leaky_relu">Leaky ReLU</option>
                          <option value="elu">ELU</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Regularizer</label>
                        <select
                          value={modelConfig.selectedRegularizer}
                          onChange={(e) =>
                            setModelConfig((prev) => ({ ...prev, selectedRegularizer: e.target.value }))
                          }
                          className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                          disabled={trainingState.isTraining}
                        >
                          <option value="none">None</option>
                          <option value="l1">L1</option>
                          <option value="l2">L2</option>
                          <option value="dropout">Dropout</option>
                          <option value="batch_norm">Batch Norm</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* training parameters section */}
                  <div className="border-t pt-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-semibold">3</span>
                      Training Parameters
                    </h3>
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Learning Rate</label>
                        <div className="flex justify-between text-xs text-gray-600 mb-2">
                          <span>0.001</span>
                          <span className="font-semibold text-gray-900">{formatNumber(hyperparameters.learningRate)}</span>
                          <span>0.1</span>
                        </div>
                        <input
                          type="range"
                          min="0.001"
                          max="0.1"
                          step="0.001"
                          value={hyperparameters.learningRate}
                          onChange={(e) =>
                            setHyperparameters((prev) => ({ ...prev, learningRate: parseFloat(e.target.value) }))
                          }
                          className="w-full accent-blue-600"
                          disabled={trainingState.isTraining}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Regularization Rate</label>
                        <div className="flex justify-between text-xs text-gray-600 mb-2">
                          <span>0.0001</span>
                          <span className="font-semibold text-gray-900">{formatNumber(hyperparameters.regularizationRate)}</span>
                          <span>0.01</span>
                        </div>
                        <input
                          type="range"
                          min="0.0001"
                          max="0.01"
                          step="0.0001"
                          value={hyperparameters.regularizationRate}
                          onChange={(e) =>
                            setHyperparameters((prev) => ({ ...prev, regularizationRate: parseFloat(e.target.value) }))
                          }
                          className="w-full accent-blue-600"
                          disabled={trainingState.isTraining}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Epochs</label>
                        <input
                          type="number"
                          value={hyperparameters.epochs}
                          onChange={(e) =>
                            setHyperparameters((prev) => ({ ...prev, epochs: parseInt(e.target.value) }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                          min="1"
                          max="1000"
                          disabled={trainingState.isTraining}
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Optimizer</label>
                      <select
                        value={modelConfig.selectedOptimizer}
                        onChange={(e) =>
                          setModelConfig((prev) => ({ ...prev, selectedOptimizer: e.target.value }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                        disabled={trainingState.isTraining}
                      >
                        <option value="adam">Adam</option>
                        <option value="sgd">SGD</option>
                        <option value="rmsprop">RMSProp</option>
                        <option value="adagrad">Adagrad</option>
                        <option value="adamw">AdamW</option>
                      </select>
                    </div>
                  </div>

                  {/* start button */}
                  <div className="border-t pt-8 flex gap-4">
                    {!trainingState.isTraining ? (
                      <button
                        onClick={handleStartTraining}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors text-base"
                      >
                        Start Training
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleStopTraining}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors text-base"
                        >
                          Stop Training
                        </button>
                        <button
                          onClick={() => setActiveTab("training")}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors text-base"
                        >
                          View Progress →
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* training tab */}
              {activeTab === "training" && (
                <div className="space-y-6">
                  {/* graphs */}
                  <div className="h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-4 flex flex-col items-center justify-center">
                    <div className="text-center">
                      <p className="text-gray-500 font-semibold mb-2">Graph</p>
                      <p className="text-sm text-gray-400">Coming soon</p>
                    </div>
                  </div>

                  {/* accuracy */}
                  <div className="h-96 bg-white">
                    <AccuracyChart
                      trainingProgress={trainingState.trainingProgress}
                      isTraining={trainingState.isTraining}
                    />
                  </div>

                  {/* status */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-xs font-semibold text-blue-700 uppercase">Current Epoch</p>
                      <p className="text-3xl font-bold text-blue-900 mt-1">{trainingState.currentEpoch}</p>
                      <p className="text-xs text-blue-600 mt-1">of {hyperparameters.epochs} epochs</p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <p className="text-xs font-semibold text-green-700 uppercase">Status</p>
                      <p className="text-3xl font-bold text-green-900 mt-1">
                        {trainingState.isTraining ? "Running" : "Complete"}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {trainingState.trainingProgress.length} epochs completed
                      </p>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <p className="text-xs font-semibold text-purple-700 uppercase">Latest Loss</p>
                      <p className="text-3xl font-bold text-purple-900 mt-1">
                        {trainingState.trainingProgress.length > 0
                          ? trainingState.trainingProgress[trainingState.trainingProgress.length - 1].loss?.toFixed(4)
                          : "—"}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">training loss</p>
                    </div>
                  </div>

                  {/* model summary */}
                  {trainingState.modelSummary && (
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Model Architecture</h3>
                      <pre className="text-xs text-gray-700 overflow-x-auto bg-gray-50 p-4 rounded max-h-48 border border-gray-200">
                        {trainingState.modelSummary}
                      </pre>
                    </div>
                  )}

                  {/* back button */}
                  {!trainingState.isTraining && (
                    <div className="border-t pt-6">
                      <button
                        onClick={() => setActiveTab("config")}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-lg font-semibold transition-colors"
                      >
                        ← Back to Configuration
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}