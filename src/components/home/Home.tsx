import AboutSection from "../about/AboutSection";
import BookAppointmentSection from "../shared/BookAppointmentSection";
import AskAnyQuery from "./AskAnyQuery";
import BlogSection from "./BlogSection";
import Corporate from "./Corporate";
import HealthCheckPackageSection from "./HealthCheckPackageSection";
import HeroSection from "./HeroSection";
import SpecialtiesSection from "./SpecialtiesSection";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <AboutSection />
      <SpecialtiesSection />
      <HealthCheckPackageSection />
      <AskAnyQuery />
      <BlogSection />
      <Corporate />
      <BookAppointmentSection />
    </div>
  );
}
