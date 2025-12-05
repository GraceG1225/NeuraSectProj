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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Model Explainability
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              This page is dedicated to explaining how neural network models make their predictions.
              Add your explainability features and visualizations here.
            </p>
            
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

