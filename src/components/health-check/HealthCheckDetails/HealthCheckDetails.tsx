"use client";
import HeroSection from "../../shared/HeroSection/HeroSection";
import HealthCheckContent from "./HealthCheckContent";

export default function HealthCheckDetails() {
  return (
    <div>
      <HeroSection
        image="/health/HealthCheck.png"
        title="Health Check Details"
        description="Review package highlights, included tests, and important information."
      />
      <HealthCheckContent />
    </div>
  );
}
