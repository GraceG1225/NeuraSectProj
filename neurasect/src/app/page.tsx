'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import { FaCheckCircle, FaBook, FaLayerGroup, FaRegQuestionCircle, FaPlusCircle, FaFileAlt, FaRegLightbulb } from "react-icons/fa";
import { FaBoltLightning } from "react-icons/fa6";
import { IoIosArrowForward, IoIosRefresh } from "react-icons/io";
import { IoBarChart } from "react-icons/io5";

interface Dataset {
  id: string;
  title: string;
}

export default function Home() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
                  href="#datasets"
                  className="btn btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <FaLayerGroup />
                  &nbsp;Explore Datasets
                </Link>
                <button className="btn btn-outline text-lg px-8 py-4 hover:bg-gray-50 transition-all duration-300">
                  <FaBook />
                  &nbsp;Learn More
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose NeuraSect?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for both beginners and experts, NeuraSect makes machine
              learning accessible and fun.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card card-hover p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <div className="scale-150">
                  <FaRegLightbulb />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Intuitive Interface
              </h3>
              <p className="text-gray-600">
                Clean, modern design that makes complex machine learning
                concepts easy to understand and explore.
              </p>
            </div>

            <div className="card card-hover p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <div className="scale-150">
                  <FaBoltLightning />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Real-time Training
              </h3>
              <p className="text-gray-600">
                Watch your neural networks learn in real-time with interactive
                visualizations and live metrics.
              </p>
            </div>

            <div className="card card-hover p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <div className="scale-150">
                  <IoBarChart />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Rich Datasets
              </h3>
              <p className="text-gray-600">
                Access a curated collection of datasets ready for machine
                learning experiments and model training.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Datasets Section */}
      <section id="datasets" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Available Datasets
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our collection of datasets, each ready for neural network
              training and analysis.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="spinner w-12 h-12"></div>
              <span className="ml-4 text-gray-600 text-lg">
                Loading datasets...
              </span>
            </div>
          ) : datasets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {datasets.map((dataset, index) => (
                <div
                  key={dataset.id || `dataset-${index}`}
                  className="card card-hover p-6 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-white text-lg font-bold">
                        {dataset.title?.charAt(0).toUpperCase() || "D"}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {dataset.title}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Neural Network Dataset
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-6">
                    Ready for machine learning experiments. Click to explore the
                    data structure and start training your models.
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaCheckCircle />
                      &nbsp;Ready
                    </div>
                    <Link
                      href={`/datasets/${dataset.id}`}
                      className="btn btn-primary text-sm px-4 py-2"
                    >
                      Explore Dataset
                      <IoIosArrowForward />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="scale-300">
                  <FaFileAlt />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No Datasets Available
              </h3>
              <p className="text-gray-600 mb-6">
                There are no datasets available at the moment. Check back later
                or contact support.
              </p>
              <button className="btn btn-outline">
                <IoIosRefresh />
                &nbsp;Refresh
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of learners exploring the fascinating world of neural
            networks and machine learning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn bg-white text-blue-600 hover:bg-gray-50 text-lg px-8 py-4 shadow-lg">
              <FaPlusCircle />
              &nbsp;Create Your First Model
            </button>
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