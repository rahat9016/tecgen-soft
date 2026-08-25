import BookAppointmentSection from "../shared/BookAppointmentSection";
import DynamicBreadcrumb from "../shared/DynamicBreadcrumb";
import HeroSection from "../shared/HeroSection/HeroSection";
import AdmissionPaymentGuide from "./AdmissionPaymentGuide";
import BreastClinicReferral from "./BreastClinicReferral";
import VisitingHoursRules from "./VisitingHoursRules";

export default function PatientVisitorGuide() {
  return (
    <div>
      <HeroSection
        image="/heroImages/home/heroImage2.jpg"
        title="Patient & Visitor Guide"
        description="Providing trusted healthcare services with advanced technology, experienced doctors, and compassionate care for you and your family"
      />
      <div className="container">
        <div className="mt-6 mb-10">
          <DynamicBreadcrumb />
        </div>
        <VisitingHoursRules />
        <BreastClinicReferral />
        <AdmissionPaymentGuide />
      </div>
      <BookAppointmentSection />
    </div>
  );
}
