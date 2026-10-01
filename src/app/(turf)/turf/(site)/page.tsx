import { About, FeaturedCourts, Hero, HowItWorks, LiveNow, Services } from "@/src/components/turf/home";

export default function TurfHomePage() {
  return (
    <>
      <Hero />
      <LiveNow />
      <About />
      <Services />
      <FeaturedCourts />
      <HowItWorks />
    </>
  );
}
