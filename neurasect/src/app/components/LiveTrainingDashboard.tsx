"use client";

import { useState } from "react";

export default function LiveTrainingDashboard() {
  const [learningRate, setLearningRate] = useState<number>(0.01);
  const [regularizationRate, setRegularizationRate] = useState<number>(0.001);

  return (
    <section className="section section-gray-bg">
      <div className="container mx-auto px-4">
        <div className="section-header">
          <h2 className="section-title">Live Training Dashboard</h2>
          <p className="section-subtitle">
            Configure your model parameters and watch real-time training progress
          </p>
        </div>

        <div className="training-dashboard-container">
          {/* Training Controls Grid */}
          <div className="training-controls-grid">
            {/* Dataset Selection */}
            <div className="training-control-box training-control-box-simple">
              <span className="text-lg font-semibold text-gray-900">Data sets</span>
            </div>

            {/* Learning Rate Slider */}
            <div className="training-control-box training-control-box-slider">
              <div className="training-control-header">
                <span className="training-control-label">Learning Rate</span>
                <span className="training-control-value">
                  {learningRate.toFixed(3)}
                </span>
              </div>
              <input
                type="range"
                min="0.001"
                max="0.1"
                step="0.001"
                value={learningRate}
                onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                className="training-slider"
              />
            </div>

            {/* Regularization Rate Slider */}
            <div className="training-control-box training-control-box-slider">
              <div className="training-control-header">
                <span className="training-control-label">Regulation Rate</span>
                <span className="training-control-value">
                  {regularizationRate.toFixed(4)}
                </span>
              </div>
              <input
                type="range"
                min="0.0001"
                max="0.01"
                step="0.0001"
                value={regularizationRate}
                onChange={(e) => setRegularizationRate(parseFloat(e.target.value))}
                className="training-slider"
              />
            </div>

            {/* Model Selection */}
            <div className="training-control-box training-control-box-simple">
              <span className="text-lg font-semibold text-gray-900">Model</span>
            </div>
          </div>

          {/* Live Plot Area */}
          <div className="training-plot-area">
            <div className="training-plot-header">
              <h3 className="training-plot-title">Training Progress</h3>
              <div className="training-live-indicator">
                <div className="training-live-dot" />
                <span className="text-sm text-gray-600">Live</span>
              </div>
            </div>

            <div className="training-plot-content">
              <div className="training-plot-placeholder">
                <svg
                  className="training-plot-icon"
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
      </div>
    </section>
  );
}

