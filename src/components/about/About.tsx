import BookAppointmentSection from "../shared/BookAppointmentSection";
import HeroSection from "../shared/HeroSection/HeroSection";
import AboutBreadcrumb from "./AboutBreadcrumb";
import AboutSection from "./AboutSection";
import GallerySection from "./GallerySection";
import PurposeCommitment from "./PurposeCommitment/PurposeCommitment";
import VideoSection from "./VideoSection";

export default function About() {
  return (
    <div>
      <HeroSection
        image="/about/purpose1.jpg"
        title="About Us"
        description="Learn more about our mission, values, and commitment to patient-centered care."
      />
      <AboutBreadcrumb />
      <AboutSection />
      <PurposeCommitment />
      <GallerySection />
      <VideoSection />
      <BookAppointmentSection />
    </div>
  );
}
