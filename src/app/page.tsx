import AboutSection from "@/src/components/agency/AboutSection";
import AgencyFooter from "@/src/components/agency/AgencyFooter";
import AgencyHeader from "@/src/components/agency/AgencyHeader";
import AuroraBackground from "@/src/components/agency/AuroraBackground";
import FaqSection from "@/src/components/agency/FaqSection";
import FinalCta from "@/src/components/agency/FinalCta";
import Hero from "@/src/components/agency/Hero";
import HowItWorks from "@/src/components/agency/HowItWorks";
import PaymentGateways from "@/src/components/agency/PaymentGateways";
import PortfolioSection from "@/src/components/agency/PortfolioSection";
import SolutionsSection from "@/src/components/agency/SolutionsSection";
import TestimonialsSection from "@/src/components/agency/TestimonialsSection";
import WhyUsSection from "@/src/components/agency/WhyUsSection";

export default function RootPage() {
  return (
    <div className="relative isolate min-h-screen overflow-x-clip bg-[#0a0a0a] [&_section[id]]:scroll-mt-20">
      <AuroraBackground />
      <AgencyHeader overlay />
      <Hero />
      <PortfolioSection />
      <WhyUsSection />
      <SolutionsSection />
      <PaymentGateways
        title={
          <>
            সহজ ও নিরাপদ{" "}
            <span className="bg-linear-to-r from-indigo-300 via-[#8F87FF] to-indigo-400 bg-clip-text text-transparent">
              পেমেন্ট সুবিধা
            </span>
          </>
        }
        desc="কাস্টমারের কাছ থেকে সহজেই পেমেন্ট সংগ্রহ করতে যোগ করুন দেশের জনপ্রিয় সব পেমেন্ট গেটওয়ে।"
      />
      <HowItWorks />
      <AboutSection />
      <TestimonialsSection />
      <FaqSection />
      <FinalCta />
      <AgencyFooter />
    </div>
  );
}
