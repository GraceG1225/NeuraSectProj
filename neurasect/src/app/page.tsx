import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import DatasetsSection from "./components/DatasetsSection";
import LiveTrainingDashboard from "./components/LiveTrainingDashboard";
import CallToActionSection from "./components/CallToActionSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <HeroSection />
      <FeaturesSection />
      <DatasetsSection />
      <LiveTrainingDashboard />
      <CallToActionSection />
    </div>
  );
}
