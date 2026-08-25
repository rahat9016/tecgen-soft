import ApplyForJobSection from "@/src/components/career/Career/ApplyForJobSection";
import EmployeeEngagementEvents from "@/src/components/career/Career/EmployeeEngagementEvents";
import DynamicBreadcrumb from "../../shared/DynamicBreadcrumb";
import HeroSection from "../../shared/HeroSection/HeroSection";
import MessageFromDirector from "./MessageFromDirector";
import MRCPSection from "./MRCPSection";
export default function Career() {
  return (
    <div>
      <HeroSection
        image="/career/mrcp.jpg"
        title="Career"
        description="Join our team and grow your career in a patient-first healthcare environment."
      />
      <div className="container">
        <div className="mt-6 mb-10">
          <DynamicBreadcrumb />
        </div>
        <MessageFromDirector />
        <ApplyForJobSection />
        <MRCPSection />
        <EmployeeEngagementEvents />
      </div>
    </div>
  );
}
