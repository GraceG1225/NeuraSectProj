'use client';
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import NeuralNetworkSection from "./components/neuralSection";
import FeaturesSection from "./components/featuresSection";
import DatasetsSection from "./components/datasetsSection";
import { FaLayerGroup, FaRegQuestionCircle } from "react-icons/fa";
import { useTheme } from "./components/theme/themeContext";

interface Dataset {
  id: string;
  title: string;
}

export default function Home() {
  const { theme } = useTheme("home");
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  const bubbleColors = useMemo(
    () => theme.bubbleColors ?? ["rgba(191, 219, 254, 0.6)", "rgba(216, 180, 254, 0.55)", "rgba(244, 231, 255, 0.55)"],
    [theme.bubbleColors],
  );

  useEffect(() => {
    async function fetchDatasets() {
      try {
        const res = await fetch("/api/dataset");
        const data: Dataset[] = await res.json();
        setDatasets(data);
      } catch (error) {
        console.error("Error fetching datasets:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDatasets();
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundImage: theme.background }}
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                Welcome to{" "}
                <span
                  className="gradient-text"
                  style={{
                    backgroundImage: theme.headingGradient,
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  NeuraSect
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                Your interactive neural network playground. Explore datasets,
                train models, and discover the power of machine learning in an
                intuitive, friendly environment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="#training"
                  className="btn btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                  style={{ backgroundImage: theme.buttonGradient }}
                >
                  <FaLayerGroup />
                  &nbsp;Explore Live Training
                </Link>
                <Link
                  href="#datasets"
                  className="btn btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                  style={{ backgroundImage: theme.buttonGradient }}
                >
                  <FaLayerGroup />
                  &nbsp;Explore Datasets
                </Link>
                <Link
                  href="/settings"
                  className="btn btn-outline text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border-2"
                  style={{ borderColor: "rgba(255,255,255,0.6)" }}
                >
                  Theme Settings
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div
          className="absolute top-20 left-10 w-20 h-20 rounded-full opacity-20 animate-pulse"
          style={{ backgroundColor: bubbleColors[0] }}
        ></div>
        <div
          className="absolute top-40 right-20 w-16 h-16 rounded-full opacity-20 animate-pulse delay-1000"
          style={{ backgroundColor: bubbleColors[1] }}
        ></div>
        <div
          className="absolute bottom-20 left-1/4 w-12 h-12 rounded-full opacity-20 animate-pulse delay-2000"
          style={{ backgroundColor: bubbleColors[2] }}
        ></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <FeaturesSection />
      </section>

      {/* Live Training Section */}
      <section id="training">
        <NeuralNetworkSection datasets={datasets} />
      </section>
       
      {/* Datasets Section */}
      <section id="datasets" className="py-20 bg-white">
        <DatasetsSection />
      </section>

      {/* Call to Action Section */}
      <section
        className="py-20"
        style={{ backgroundImage: theme.buttonGradient }}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of learners exploring the fascinating world of neural
            networks and machine learning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 transition-all duration-300">
              <FaRegQuestionCircle />
              &nbsp;Learn the Basics
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}