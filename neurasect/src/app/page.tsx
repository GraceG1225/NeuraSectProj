<<<<<<< HEAD
<<<<<<< HEAD
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
=======
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
>>>>>>> 28c9a9d (changes)
=======
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
>>>>>>> 28c9a9de61245cca43f4cb0c7469640012651dae

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
<<<<<<< HEAD
<<<<<<< HEAD
    <div className="centered-div">
      <h1 className="text-2xl">Datasets:</h1>
        <ul className="list-disc mt-4 space-y-2">
            {datasets.map((dataset) => (
            <li key={dataset.id}>
              <Link href={`/datasets/${dataset.id}`}>
              {dataset.title}
              </Link>
            </li>
          ))}
        </ul>
=======
=======
>>>>>>> 28c9a9de61245cca43f4cb0c7469640012651dae
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
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  Explore Datasets
                </Link>
                <button className="btn btn-outline text-lg px-8 py-4 hover:bg-gray-50 transition-all duration-300">
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
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  Learn More
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
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
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
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
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
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
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
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Ready
                    </div>
                    <Link
                      href={`/datasets/${dataset.id}`}
                      className="btn btn-primary text-sm px-4 py-2"
                    >
                      Explore Dataset
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No Datasets Available
              </h3>
              <p className="text-gray-600 mb-6">
                There are no datasets available at the moment. Check back later
                or contact support.
              </p>
              <button className="btn btn-outline">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Create Your First Model
            </button>
            <button className="btn border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 transition-all duration-300">
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
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Learn the Basics
            </button>
          </div>
        </div>
      </section>
<<<<<<< HEAD
>>>>>>> 28c9a9d (changes)
=======
>>>>>>> 28c9a9de61245cca43f4cb0c7469640012651dae
    </div>
  );
}
