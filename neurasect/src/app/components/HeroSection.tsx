import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <div className="animate-fade-in">
            <h1 className="hero-title">
              Welcome to{" "}
              <span className="gradient-text">NeuraSect</span>
            </h1>
            <p className="hero-description">
              Your interactive neural network playground. Explore datasets,
              train models, and discover the power of machine learning in an
              intuitive, friendly environment.
            </p>
            <div className="hero-actions">
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
      <div className="floating-element top-20 left-10 w-20 h-20 bg-blue-200 rounded-full"></div>
      <div className="floating-element top-40 right-20 w-16 h-16 bg-purple-200 rounded-full" style={{ animationDelay: "1s" }}></div>
      <div className="floating-element bottom-20 left-1/4 w-12 h-12 bg-pink-200 rounded-full" style={{ animationDelay: "2s" }}></div>
    </section>
  );
}

