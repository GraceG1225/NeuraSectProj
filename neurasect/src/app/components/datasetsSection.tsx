'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import { FaCheckCircle, FaFileAlt } from "react-icons/fa";
import { IoIosArrowForward, IoIosRefresh } from "react-icons/io";

interface Dataset {
  id: string;
  title: string;
}

export default function DatasetsSection() {
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
                  dataset.
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
            <button
              className="btn btn-outline"
              onClick={() => location.reload()}
            >
              <IoIosRefresh />
              &nbsp;Refresh
            </button>
          </div>
        )}
      </div>
    </section>
  );
}