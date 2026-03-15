"use client";
import Link from "next/link";

import { useState } from "react";
import { useTheme } from "../components/theme/themeContext";

const MOCK_FEATURE_IMPORTANCE = [
  { name: "Feature A", value: 0.32 },
  { name: "Feature B", value: 0.24 },
  { name: "Feature C", value: 0.18 },
  { name: "Feature D", value: 0.14 },
  { name: "Feature E", value: 0.12 },
];

export default function ExplainabilityPage() {
  const { theme } = useTheme("explainability");
  const [activeTab, setActiveTab] = useState<"feature" | "whatif" | "comparison">("feature");
  const [comparisonCount, setComparisonCount] = useState(1);


  return (
    <div
      className="min-h-screen"
      style={{ backgroundImage: theme.background }}
    >
      {/* Header Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                <span
                  className="gradient-text"
                  style={{
                    backgroundImage: theme.headingGradient,
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Explainability
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                Understand how your neural network makes decisions. Explore model
                interpretability and transparency in machine learning.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/"
                  className="btn btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                  style={{ backgroundImage: theme.buttonGradient }}
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div
          className="absolute top-20 left-10 w-20 h-20 rounded-full opacity-20 animate-pulse"
          style={{ backgroundColor: theme.bubbleColors[0] }}
        ></div>
        <div
          className="absolute top-40 right-20 w-16 h-16 rounded-full opacity-20 animate-pulse delay-1000"
          style={{ backgroundColor: theme.bubbleColors[1] }}
        ></div>
        <div
          className="absolute bottom-20 left-1/4 w-12 h-12 rounded-full opacity-20 animate-pulse delay-2000"
          style={{ backgroundColor: theme.bubbleColors[2] }}
        ></div>
      </section>

      {/* Main Content Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Terminology
            </h2>
            <div className="space-y-10 text-gray-700 text-lg leading-relaxed">
              <div>
                <h3 className="text-2xl font-semibold mb-3">Datasets</h3>
                <p>
                  A dataset is the collection of data your model learns from. It usually has
                  <strong> features</strong> (values that the model uses to predict) and <strong>labels</strong> (values
                  that we want the model to predict). A good dataset improves model accuracy, while a poor one leads to bad predictions.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-3">Models</h3>
                <p>
                  The model is the mathematical structure that tries to learn relationships between
                  inputs and outputs. Neural networks are built from layers of neurons that learn patterns.
                  These models attempt to predict data based on these patterns.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-3">Layers & Neurons</h3>
                <p>
                  <strong>Layers</strong> are the building blocks of neural networks. Each layer processes
                  information and passes it forward. <strong>Neurons</strong> are the units inside layers
                  that perform calculations. More layers/neurons can learn more complex patterns, but may
                  require more data.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-3">Optimizer</h3>
                <p>
                  An optimizer adjusts the model&apos;s parameters (weights) to reduce prediction errors.
                  Common optimizers include <strong>SGD</strong>, <strong>Adam</strong>, and
                  <strong> RMSProp</strong>.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-3">Activation Function</h3>
                <p>
                  Activation functions define how a neuron reacts to input signals. Popular functions include
                  <strong> ReLU</strong>, <strong>Sigmoid</strong>, and <strong>Tanh</strong>.
                  They help the network learn non&ndash;linear patterns.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-3">Learning Rate</h3>
                <p>
                  The learning rate controls how big the weight updates are during training. A high learning
                  rate learns fast but risks instability; a low one is stable but slow.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-3">Regularizer & Regularization Rate</h3>
                <p>
                  Regularization prevents overfitting, whenever the model memorizes data instead of learning
                  general patterns. Common regularizers include <strong>L1</strong>, <strong>L2</strong>, and&nbsp;
                  <strong>Dropout</strong>. The <strong>regularization rate</strong> controls how strong the
                  regularization effect is.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-3">Train/Test Split</h3>
                <p>
                  To evaluate a model, the dataset is divided into a <strong>training set</strong> the model
                  learns from, and a <strong>test set</strong> used to measure how well it performs on new
                  data. For example, datasets are commonly split in ratios of 80/20 or 70/30.
                </p>
              </div>
            </div>

            {/* Explainability 101 */}
            <h2 className="py-10 text-3xl font-bold text-gray-900 mb-4">
              Explainability 101
            </h2>
            <div className="mb-10 p-6 bg-indigo-50/60 rounded-xl border border-indigo-100 text-gray-700 text-lg leading-relaxed space-y-4">
              <p>
                <strong>What it is:</strong> Explainability is about understanding
                <em> why</em> a model made a particular decision—which inputs (features)
                mattered most and how they influenced the output.
              </p>
              <p>
                <strong>Why it matters:</strong> It builds trust, helps spot bias, and
                makes it easier to debug and improve models. Regulators and users
                increasingly expect AI decisions to be interpretable.
              </p>
              <p>
                <strong>Common methods:</strong>{" "}
                <strong>Feature importance</strong> ranks which inputs drive predictions;{" "}
                <strong>SHAP</strong> assigns each feature a contribution per prediction;{" "}
                <strong>Saliency / attention</strong> highlights important regions in
                images or sequences.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Model Explainability
            </h2>


            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {(
                [
                  { id: "feature", label: "Feature importance" },
                  { id: "whatif", label: "What-if" },
                  { id: "comparison", label: "Comparison" },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === id
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === "feature" && (
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Top features (example)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Longer bars = higher impact on the model&apos;s prediction. Use real
                  training data later to show actual feature importances.
                </p>
                <div className="space-y-3 max-w-md">
                  {MOCK_FEATURE_IMPORTANCE.map(({ name, value }) => (
                    <div key={name} className="flex items-center gap-3">
                      <span className="w-24 text-sm font-medium text-gray-700 shrink-0">
                        {name}
                      </span>
                      <div className="flex-1 h-6 bg-gray-200 rounded overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded"
                          style={{ width: `${value * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-10">
                        {(value * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "whatif" && (
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  What-if analysis
                </h3>
                <p className="text-gray-700">
                  Change input values (e.g. one feature) and see how the prediction
                  changes. This helps you understand sensitivity and fairness. Connect
                  this view to your trained model and a single sample to enable
                  real what-if exploration.
                </p>
              </div>
            )}

            {activeTab === "comparison" && (
              <>
                {/* Comparison controls */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-3 py-1.5 rounded-full border border-gray-300 bg-white text-sm font-semibold text-gray-800">
                    Explainability

                  <span className="px-3 py-1.5 rounded-full border border-gray-300 bg-white text-sm font-semibold text-gray-800">
                    Comparison
                  </span>

                  <button
                    type="button"
                    onClick={() => setComparisonCount((c) => Math.max(1, c - 1))}
                    disabled={comparisonCount === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 bg-white text-lg font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Remove panel"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => setComparisonCount((c) => Math.min(4, c + 1))}
                    disabled={comparisonCount === 4}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-indigo-600 text-white text-lg font-bold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Add panel"
                  >
                    +
                  </button>
                </div>

                <div
                  className="grid gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4"
                  style={{
                    gridTemplateColumns: `repeat(${comparisonCount}, minmax(0, 1fr))`,
                  }}
                >

                  {Array.from({ length: comparisonCount }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
                    >
                      <h4 className="font-semibold text-gray-900 mb-2">

                        Explainability {i + 1}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Use this panel to compare different runs (e.g. different
                        models or preprocessing). Load a session or dataset to see
                        feature importance or SHAP here.
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>
        </div>
      </section>
    </div>
  );
}