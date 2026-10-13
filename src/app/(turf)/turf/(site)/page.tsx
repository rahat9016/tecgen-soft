import { About, FeaturedCourts, Hero, HowItWorks, LiveNow, PrimeTimeCta, Services } from "@/src/components/turf/home";

export default function TurfHomePage() {
  return (
    <>
      <Hero />
      <LiveNow />
      <FeaturedCourts />
      <HowItWorks />
      <Services />
      <About />
      <PrimeTimeCta />
    </>
  );
}
