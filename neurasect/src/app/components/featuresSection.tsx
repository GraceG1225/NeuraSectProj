import { FaRegLightbulb } from "react-icons/fa";
import { FaBoltLightning } from "react-icons/fa6";
import { IoBarChart } from "react-icons/io5";

export default function FeaturesSection() {
  return (
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
          <div className="card card-hover p-10 text-center">
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
  );
}