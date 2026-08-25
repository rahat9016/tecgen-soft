import DynamicBreadcrumb from "../shared/DynamicBreadcrumb";
import HeroSection from "../shared/HeroSection/HeroSection";
import DoctorList from "./DoctorList";

export default function DoctorAppointment() {
  return (
    <div>
      <HeroSection
        image="/doctors/heroBg.jpg"
        title="Doctor Appointment"
        description="Find specialists and book your appointment quickly and easily."
      />
      <div className="container">
        <div className="mt-6 mb-10">
          <DynamicBreadcrumb />
        </div>
        <DoctorList />
      </div>
    </div>
  );
}
