import AgencyFooter from "@/src/components/agency/AgencyFooter";
import AgencyHeader from "@/src/components/agency/AgencyHeader";
import FaqSection from "@/src/components/agency/FaqSection";
import FinalCta from "@/src/components/agency/FinalCta";
import GrowthSection from "@/src/components/agency/GrowthSection";
import Hero from "@/src/components/agency/Hero";
import HowItWorks from "@/src/components/agency/HowItWorks";
import PricingPreview from "@/src/components/agency/PricingPreview";
import SmoothScroll from "@/src/components/agency/SmoothScroll";
import SolutionsSection from "@/src/components/agency/SolutionsSection";
import TrustSection from "@/src/components/agency/TrustSection";
import WhyUsSection from "@/src/components/agency/WhyUsSection";

export default function RootPage() {
  return (
    <div className="min-h-screen bg-white">
      <AgencyHeader />
      <SmoothScroll>
        <div className="h-16" aria-hidden="true" />
        <Hero />
        <TrustSection />
        <SolutionsSection />
        <HowItWorks />
        <WhyUsSection />
        <PricingPreview />
        <GrowthSection />
        <FaqSection />
        <FinalCta />
        <AgencyFooter />
      </SmoothScroll>
    </div>
  );
}
