'use client';
import { useState } from "react";

interface Dataset {
  id: string;
  title: string;
}

interface neuralSectionProps {
  datasets: Dataset[];
}

export default function neuralSection({ datasets }: neuralSectionProps) {
  const [selectedDataset, setSelectedDataset] = useState<string>("iris");
  const [learningRate, setLearningRate] = useState<number>(0.01);
  const [regularizationRate, setRegularizationRate] = useState<number>(0.001);
  const [selectedModel, setSelectedModel] = useState<string>("neural_network");
  const [trainTestSplit, setTrainTestSplit] = useState<number>(0.8);

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Plot Area */}
          <div className="lg:col-span-2">
            <div className="card p-6 h-96">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Training Progress</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Live</span>
                </div>
              </div>

              {/* Placeholder for plot */}
              <div className="w-full h-80 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <p className="text-gray-500 text-lg">Live Plot Area</p>
                  <p className="text-gray-400 text-sm">Training metrics will appear here</p>
                </div>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            {/* Dataset Selection */}
            <div className="card p-3">
              <h3 className="text-base font-bold text-gray-900 mb-3">Dataset</h3>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Select Dataset</label>
                <select
                  value={selectedDataset}
                  onChange={(e) => setSelectedDataset(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a dataset</option>
                  {datasets && datasets.length > 0 ? (
                    datasets.map((dataset) => (
                      <option key={dataset.id} value={dataset.id}>
                        {dataset.title}
                      </option>
                    ))
                  ) : (
                    <option disabled>No datasets available</option>
                  )}
                </select>
              </div>
            </div>

            {/* Learning Rate */}
            <div className="card p-3">
              <h3 className="text-base font-bold text-gray-900 mb-3">Learning Rate</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>0.001</span>
                  <span className="font-medium">{learningRate}</span>
                  <span>0.1</span>
                </div>
                <input
                  type="range"
                  min="0.001"
                  max="0.1"
                  step="0.001"
                  value={learningRate}
                  onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                  className="slider"
                />
              </div>
            </div>

            {/* Regularization Rate */}
            <div className="card p-3">
              <h3 className="text-base font-bold text-gray-900 mb-3">Regularization Rate</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>0.0001</span>
                  <span className="font-medium">{regularizationRate}</span>
                  <span>0.01</span>
                </div>
                <input
                  type="range"
                  min="0.0001"
                  max="0.01"
                  step="0.0001"
                  value={regularizationRate}
                  onChange={(e) => setRegularizationRate(parseFloat(e.target.value))}
                  className="slider"
                />
              </div>
            </div>

            {/* Model Selection */}
            <div className="card p-3">
              <h3 className="text-base font-bold text-gray-900 mb-3">Model</h3>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Select Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="neural_network">Neural Network</option>
                  <option value="cnn">Convolutional Neural Network</option>
                  <option value="rnn">Recurrent Neural Network</option>
                  <option value="transformer">Transformer</option>
                </select>
              </div>
            </div>

            {/* Train/Test Split */}
            <div className="card p-3">
              <h3 className="text-base font-bold text-gray-900 mb-3">Train/Test Split</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>60%</span>
                  <span className="font-medium">{Math.round(trainTestSplit * 100)}%</span>
                  <span>90%</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="0.9"
                  step="0.05"
                  value={trainTestSplit}
                  onChange={(e) => setTrainTestSplit(parseFloat(e.target.value))}
                  className="slider"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Train: {Math.round(trainTestSplit * 100)}%</span>
                  <span>Test: {Math.round((1 - trainTestSplit) * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Start Training Button */}
            <button className="w-full btn btn-primary py-3 text-lg font-semibold">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-8-8h8v8a4 4 0 01-8 0v-8z"
                />
              </svg>
              Start Training
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
