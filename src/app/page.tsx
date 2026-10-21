import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { DashboardPreview } from "@/components/DashboardPreview";
import { FeaturesSection } from "@/components/FeaturesSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { SamplePlanSection } from "@/components/SamplePlanSection";
import { HealthChecker } from "@/components/HealthChecker";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <HeroSection />

        {/* Dashboard Preview Shell */}
        <DashboardPreview />

        {/* Core Capabilities */}
        <FeaturesSection />

        {/* How It Works Architecture */}
        <HowItWorksSection />

        {/* Full Example Plan Blueprint */}
        <SamplePlanSection />

        {/* Live System Health Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <HealthChecker />
        </div>
      </main>

      <Footer />
    </>
  );
}
