'use client';
import Link from "next/link";
import { useTheme } from "../components/theme/themeContext";

export default function ExplainabilityPage() {
  const { theme } = useTheme("explainability");

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
                  A dataset is the collection of data your model learns from. It is usually has
                  <strong> features</strong> (values that the model uses to predict) and <strong>labels</strong> (values 
                  that we want the model to predict). A good dataset improves model accuracy, while a poor one leads to bad predictions.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-3">Models</h3>
                <p>
                  The model is the mathematical structure that tries to learn relationships between
                  inputs and outputs. Neural networks are built from layers of neurons that learn patterns.
                  These models attempt to prediction data based off this patterns.
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

            {/* Placeholder for explainability content */}
            <div className="bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300">
              <p className="text-center text-gray-500">
                Explainability content will go here
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}