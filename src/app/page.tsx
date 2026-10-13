import AboutSection from "@/src/components/agency/AboutSection";
import AgencyFooter from "@/src/components/agency/AgencyFooter";
import AgencyHeader from "@/src/components/agency/AgencyHeader";
import AuroraBackground from "@/src/components/agency/AuroraBackground";
import FaqSection from "@/src/components/agency/FaqSection";
import FinalCta from "@/src/components/agency/FinalCta";
import Hero from "@/src/components/agency/Hero";
import HowItWorks from "@/src/components/agency/HowItWorks";
import PortfolioSection from "@/src/components/agency/PortfolioSection";
import SmoothScroll from "@/src/components/agency/SmoothScroll";
import SolutionsSection from "@/src/components/agency/SolutionsSection";
import TestimonialsSection from "@/src/components/agency/TestimonialsSection";
import WhyUsSection from "@/src/components/agency/WhyUsSection";

export default function RootPage() {
  return (
    <div className="relative isolate min-h-screen overflow-x-clip bg-[#0a0a0a]">
      <AuroraBackground />
      <AgencyHeader overlay />
      <SmoothScroll>
        <Hero />
        <PortfolioSection />
        <SolutionsSection />
        <HowItWorks />
        <WhyUsSection />
        <AboutSection />
        <TestimonialsSection />
        <FaqSection />
        <FinalCta />
        <AgencyFooter />
      </SmoothScroll>
    </div>
  );
}
