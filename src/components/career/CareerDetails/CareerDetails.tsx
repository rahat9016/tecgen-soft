import HeroSection from "../../shared/HeroSection/HeroSection";
import CareerDetailsContent from "./CareerDetailsContent";

export default function CareerDetails() {
  return (
    <div>
      <HeroSection
        image="/career/mrcp.jpg"
        title="Career Details"
        description="View role details, responsibilities, and application requirements."
      />
      <CareerDetailsContent />
    </div>
  );
}
