export default function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg
          className="feature-icon"
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
      ),
      iconColor: "feature-icon-blue",
      title: "Intuitive Interface",
      description: "Clean, modern design that makes complex machine learning concepts easy to understand and explore.",
    },
    {
      icon: (
        <svg
          className="feature-icon"
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
      ),
      iconColor: "feature-icon-purple",
      title: "Real-time Training",
      description: "Watch your neural networks learn in real-time with interactive visualizations and live metrics.",
    },
    {
      icon: (
        <svg
          className="feature-icon"
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
      ),
      iconColor: "feature-icon-green",
      title: "Rich Datasets",
      description: "Access a curated collection of datasets ready for machine learning experiments and model training.",
    },
  ];

  return (
    <section className="section section-alt-bg">
      <div className="container mx-auto px-4">
        <div className="section-header">
          <h2 className="section-title">Why Choose NeuraSect?</h2>
          <p className="section-subtitle">
            Built for both beginners and experts, NeuraSect makes machine
            learning accessible and fun.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className={`feature-icon-container ${feature.iconColor}`}>
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

