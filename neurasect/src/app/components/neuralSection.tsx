"use client";

import { useState, useEffect } from "react";
import { saveFile, getAllFiles, deleteFile } from "../lib/indexedDBHelpers";

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

  const [numLayers, setNumLayers] = useState<number>(1);
  const [numNeurons, setNumNeurons] = useState<number>(8);

  const [localDatasets, setLocalDatasets] = useState<any[]>([]);
  const [localModels, setLocalModels] = useState<any[]>([]);

  const formatNumber = (num: number) => {
    if (num < 0.001) return num.toFixed(4);
    if (num < 0.01) return num.toFixed(3);
    return num.toFixed(2);
  };

  const increment = (setter: (value: number) => void, value: number) => setter(value + 1);
  const decrement = (setter: (value: number) => void, value: number) => setter(Math.max(1, value - 1));

  async function refreshLocalFiles() {
    const ds = await getAllFiles("datasets");
    const ms = await getAllFiles("models");

    setLocalDatasets(ds);
    setLocalModels(ms);
  }

  useEffect(() => {
    refreshLocalFiles();
  }, []);

  //upload dataset
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

  //upload model
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

  //delete dataset
  async function handleDeleteDataset(id: string) {
    await deleteFile("datasets", id);
    await refreshLocalFiles();
  }

  //delete model
  async function handleDeleteModel(id: string) {
    await deleteFile("models", id);
    await refreshLocalFiles();
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 text-gray-400">
        {/* header */}
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

            {/* upload */}
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
                />

                {/* local datasets */}
                <div className="mt-2 text-sm text-gray-600">
                  {localDatasets.length > 0 ? (
                    localDatasets.map((d) => (
                      <div key={d.id} className="mt-1 flex justify-between items-center">
                        <span>{d.id}</span>
                        <button
                          onClick={() => handleDeleteDataset(d.id)}
                          className="text-red-500 text-sm"
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
                />

                {/* local models */}
                <div className="mt-2 text-sm text-gray-600">
                  {localModels.length > 0 ? (
                    localModels.map((m) => (
                      <div key={m.id} className="mt-1 flex justify-between items-center">
                        <span>{m.id}</span>
                        <button
                          onClick={() => handleDeleteModel(m.id)}
                          className="text-red-500 text-sm"
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

            {/* top controls */}
            <div className="grid grid-cols-2 gap-6 w-full">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  Dataset
                </h3>
                <select
                  value={selectedDataset}
                  onChange={(e) => setSelectedDataset(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
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
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  Model
                </h3>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
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

            {/* middle controls */}
            <div className="grid grid-cols-3 gap-6 w-full">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Regularizer</h3>
                <select
                  value={selectedRegularizer}
                  onChange={(e) => setSelectedRegularizer(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
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
              <div className="w-full lg:w-2/3 h-80 bg-gray-100 rounded-lg border-2 border-dashed flex items-center justify-center">
                <p className="text-gray-500 text-lg">Graph</p>
              </div>

              <div className="w-full lg:w-1/3 h-80 bg-gray-100 rounded-lg border-2 border-dashed flex items-center justify-center">
                <p className="text-gray-500 text-lg">Live Loss Plot</p>
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
                />
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Regularization Rate</h3>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>0.0001</span>
                  <span className="font-bold">{formatNumber(regularizationRate)}</span>
                  <span>0.01</span>
                </div>
                <input
                  type="range"
                  min="0.0001"
                  max="0.01"
                  step="0.0001"
                  value={regularizationRate}
                  onChange={(e) => setRegularizationRate(parseFloat(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Train/Test Split</h3>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>60%</span>
                  <span className="font-bold">{Math.round(trainTestSplit * 100)}%</span>
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
                />
              </div>
            </div>

            {/* bottom controls */}
            <div className="pt-6 border-t mt-4">
              <div className="flex flex-col lg:flex-row justify-center items-center gap-8">
                {/* layers */}
                <div className="text-center">
                  <h3 className="font-bold text-gray-600 mb-2">Layers</h3>
                  <div className="flex justify-center items-center space-x-3">
                    <button
                      onClick={() => decrement(setNumLayers, numLayers)}
                      className="px-3 py-1 bg-gray-200 rounded-full font-bold"
                    >
                      -
                    </button>
                    <span className="text-lg font-semibold text-gray-600">{numLayers}</span>
                    <button
                      onClick={() => increment(setNumLayers, numLayers)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-full font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* neurons */}
                <div className="text-center">
                  <h3 className="font-bold text-gray-600 mb-2">Neurons</h3>
                  <div className="flex justify-center items-center space-x-3 ">
                    <button
                      onClick={() => decrement(setNumNeurons, numNeurons)}
                      className="px-3 py-1 bg-gray-200 rounded-full font-bold"
                    >
                      -
                    </button>
                    <span className="text-lg font-semibold text-gray-600">{numNeurons}</span>
                    <button
                      onClick={() => increment(setNumNeurons, numNeurons)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-full font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold">
                    Start Training
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}