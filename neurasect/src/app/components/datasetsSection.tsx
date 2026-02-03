"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
    <section id="datasets" className="section">
      <div className="container mx-auto px-4">
        <div className="section-header">
          <h2 className="section-title">Available Datasets</h2>
          <p className="section-subtitle">
            Explore our collection of datasets, each ready for neural network
            training and analysis.
          </p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner w-12 h-12"></div>
            <span className="loading-text">Loading datasets...</span>
          </div>
        ) : datasets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {datasets.map((dataset, index) => (
              <div
                key={dataset.id || `dataset-${index}`}
                className="dataset-card animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="dataset-header">
                  <div className="dataset-icon">
                    <span className="dataset-icon-text">
                      {dataset.title?.charAt(0).toUpperCase() || "D"}
                    </span>
                  </div>
                  <div>
                    <h3 className="dataset-title">{dataset.title}</h3>
                    <p className="dataset-subtitle">Neural Network Dataset</p>
                  </div>
                </div>

                <p className="dataset-description">
                  Ready for machine learning experiments. Click to explore the
                  data structure and start training your models.
                </p>

                <div className="dataset-footer">
                  <div className="dataset-status">
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
          <div className="empty-state">
            <div className="empty-state-icon-container">
              <svg
                className="empty-state-icon"
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
            <h3 className="empty-state-title">No Datasets Available</h3>
            <p className="empty-state-description">
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
  );
}

