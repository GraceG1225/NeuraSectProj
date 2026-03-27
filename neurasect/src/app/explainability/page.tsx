"use client";
import Link from "next/link";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useTheme } from "../components/theme/themeContext";

const EXPLAINABILITY_CONFIG_KEY = "explainability:modelConfig";

type ModelConfig = {
  dataset: string;
  datasetName: string;
  model: string;
  regularizer: string;
  optimizer: string;
  activation: string;
};

const DEFAULT_MODEL_CONFIG: ModelConfig = {
  dataset: "iris",
  datasetName: "Iris",
  model: "neural_network",
  regularizer: "dropout",
  optimizer: "adam",
  activation: "relu",
};

const toLabel = (value: string) =>
  value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function ExplainabilityPage() {
  const { theme } = useTheme("explainability");
  const [comparisonCount, setComparisonCount] = useState(1);
  const [selectedId, setSelectedId] = useState("");
  const [comparisonMethods, setComparisonMethods] = useState<string[]>([
    "A",
    "A",
    "A",
    "A",
  ]);
  const [inputImages, setInputImages] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [modifiedImages, setModifiedImages] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [modelConfig, setModelConfig] = useState<ModelConfig>(DEFAULT_MODEL_CONFIG);

  const updateImageAtIndex = (
    setter: Dispatch<SetStateAction<(string | null)[]>>,
    index: number,
    file: File | null
  ) => {
    setter((prev) => {
      const next = [...prev];
      if (next[index]) {
        URL.revokeObjectURL(next[index]!);
      }
      next[index] = file ? URL.createObjectURL(file) : null;
      return next;
    });
  };

  useEffect(() => {
    const loadConfig = () => {
      const raw = localStorage.getItem(EXPLAINABILITY_CONFIG_KEY);
      if (!raw) return;

      try {
        const parsed = JSON.parse(raw) as Partial<ModelConfig>;
        setModelConfig({
          dataset: parsed.dataset || DEFAULT_MODEL_CONFIG.dataset,
          datasetName: parsed.datasetName || DEFAULT_MODEL_CONFIG.datasetName,
          model: parsed.model || DEFAULT_MODEL_CONFIG.model,
          regularizer: parsed.regularizer || DEFAULT_MODEL_CONFIG.regularizer,
          optimizer: parsed.optimizer || DEFAULT_MODEL_CONFIG.optimizer,
          activation: parsed.activation || DEFAULT_MODEL_CONFIG.activation,
        });
      } catch {
        setModelConfig(DEFAULT_MODEL_CONFIG);
      }
    };

    loadConfig();
    window.addEventListener("storage", loadConfig);
    window.addEventListener("explainability-config-updated", loadConfig);

    return () => {
      window.removeEventListener("storage", loadConfig);
      window.removeEventListener("explainability-config-updated", loadConfig);
    };
  }, []);

  useEffect(() => {
    return () => {
      inputImages.forEach((imageUrl) => {
        if (imageUrl) URL.revokeObjectURL(imageUrl);
      });
      modifiedImages.forEach((imageUrl) => {
        if (imageUrl) URL.revokeObjectURL(imageUrl);
      });
    };
  }, [inputImages, modifiedImages]);

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
            <h2 className="py-10 text-3xl font-bold text-gray-900 mb-8">
              Model Explainability
            </h2>
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="px-4 py-2 rounded bg-sky-300 text-gray-900 font-semibold">
                Dataset Selected: {modelConfig.datasetName || toLabel(modelConfig.dataset)}
              </span>
              <span className="px-4 py-2 rounded bg-sky-300 text-gray-900 font-semibold">
                Model: {toLabel(modelConfig.model)}
              </span>
              <span className="px-4 py-2 rounded bg-sky-300 text-gray-900 font-semibold">
                Regularizer: {toLabel(modelConfig.regularizer)}
              </span>
              <span className="px-4 py-2 rounded bg-sky-300 text-gray-900 font-semibold">
                Optimizer: {toLabel(modelConfig.optimizer)}
              </span>
              <span className="px-4 py-2 rounded bg-sky-300 text-gray-900 font-semibold">
                Activation: {toLabel(modelConfig.activation).toUpperCase()}
              </span>
            </div>

            <>
                {/* Input controls */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-lg font-semibold text-white bg-pink-500 hover:bg-pink-600 transition-colors"
                  >
                    Randomized Example
                  </button>
                  <label
                    htmlFor="comparison-id"
                    className="px-4 py-2.5 rounded-lg font-semibold text-white bg-pink-500"
                  >
                    ID :
                  </label>
                  <input
                    id="comparison-id"
                    type="text"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    placeholder="input"
                    className="w-36 px-3 py-2.5 rounded-lg border border-pink-300 bg-white text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>

                {/* Comparison controls */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-3 py-1.5 rounded-full border border-gray-300 bg-white text-sm font-semibold text-gray-800">
                    Comparison
                  </span>
                  <span className="text-lg font-semibold text-gray-700">
                    {comparisonCount}
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
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-4">
                  {Array.from({ length: comparisonCount }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
                    >
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Explainability {i + 1} (Method {comparisonMethods[i]})
                      </h4>

                      <div className="flex items-center gap-3 mb-3">
                        <label className="text-sm font-semibold text-gray-700">
                          Explainability Method
                        </label>
                        <select
                          value={comparisonMethods[i]}
                          onChange={(e) =>
                            setComparisonMethods((prev) => {
                              const next = [...prev];
                              next[i] = e.target.value;
                              return next;
                            })
                          }
                          className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                          {["A", "B", "C", "D"].map((method) => (
                            <option key={method} value={method}>
                              {method}
                            </option>
                          ))}
                        </select>
                      </div>

                      <p className="text-sm text-gray-600">
                        Use this panel to compare different runs. ID input:
                        {" "}
                        {selectedId || "none"}
                        . Randomized Example is currently a placeholder button.
                      </p>

                      <div className="mt-4 flex flex-row gap-4 items-start">
                        <div className="space-y-2 flex-1 min-w-0">
                          <label className="block text-sm font-semibold text-gray-700 text-center">
                            Input Image
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              updateImageAtIndex(
                                setInputImages,
                                i,
                                e.target.files?.[0] || null
                              )
                            }
                            className="w-full text-sm text-gray-700"
                          />
                          <div className="h-64 rounded-lg border border-gray-200 bg-sky-50 flex items-center justify-center overflow-hidden">
                            {inputImages[i] ? (
                              <img
                                src={inputImages[i] as string}
                                alt={`Input preview ${i + 1}`}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span className="text-sm text-gray-500">No input image</span>
                            )}
                          </div>
                        </div>

                        <div className="w-px self-stretch bg-gray-300"></div>

                        <div className="space-y-2 flex-1 min-w-0">
                          <label className="block text-sm font-semibold text-gray-700 text-center">
                            Modified / Comparison Image
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              updateImageAtIndex(
                                setModifiedImages,
                                i,
                                e.target.files?.[0] || null
                              )
                            }
                            className="w-full text-sm text-gray-700"
                          />
                          <div className="h-64 rounded-lg border border-gray-200 bg-sky-50 flex items-center justify-center overflow-hidden">
                            {modifiedImages[i] ? (
                              <img
                                src={modifiedImages[i] as string}
                                alt={`Modified preview ${i + 1}`}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span className="text-sm text-gray-500">
                                No comparison image
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            </>
          </div>
        </div>
      </section>
    </div>
  );
}