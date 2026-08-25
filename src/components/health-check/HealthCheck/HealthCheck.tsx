import HeroSection from "../../shared/HeroSection/HeroSection";
import SocialMedia from "../../shared/SocialMedia/SocialMedia";
import HealthCheckPackagesSection from "./HealthCheckPackagesSection";

export default function HealthCheck() {
  return (
    <div>
      <HeroSection
        image="/HealthCheck/bg.png"
        title="Health Check Packages"
        description="Choose a package tailored to your health goals and preventive care needs."
      />
      <HealthCheckPackagesSection />
      <SocialMedia />
    </div>
  );
}
