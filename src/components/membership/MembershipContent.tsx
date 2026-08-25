import Corporate from "../home/Corporate";
import { Button } from "../ui/button";
import CorporatePackageCard from "./CorporatePackageCard";
import { generalMembershipDetails } from "./generalMembershipDetails";
import {
  CorporatePackage,
  CorporatePackageSelection,
  MembershipType,
} from "./types";

export default function MembershipContent({
  membershipType,
  activePackages,
  onOpenGeneralRequest,
  onOpenCorporateRequest,
}: {
  membershipType: MembershipType;
  activePackages: CorporatePackage[];
  onOpenGeneralRequest: () => void;
  onOpenCorporateRequest: (item: CorporatePackageSelection) => void;
}) {
  const details = generalMembershipDetails;

  return membershipType === "general" ? (
    <div className="mt-6">
      <p className="text-sm leading-6 text-secondary-gary">
        {details.description}
      </p>

      <div className="mt-6">
        <h4 className="text-xl font-semibold text-secondary-dark">Benefits:</h4>
        <ul className="mt-3 space-y-2 text-sm text-secondary-gary list-disc pl-5">
          {details.benefits.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <h4 className="text-xl font-semibold text-secondary-dark">Notice:</h4>
        <ul className="mt-3 space-y-2 text-sm text-secondary-gary list-disc pl-5">
          {details.notices.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <Button
          type="button"
          onClick={onOpenGeneralRequest}
          className="px-5 h-10 text-sm font-medium"
        >
          {details.buttonLabel} →
        </Button>
      </div>
    </div>
  ) : (
    <div className="mt-6">
      <p className="text-base leading-6 text-secondary-foreground">
        Support your employees’ health with flexible corporate plans designed to
        improve workplace wellness and productivity. Our Corporate Membership
        options—Red, Green, and Premium—offer tailored healthcare benefits that
        meet the needs of different organizations. From essential medical
        coverage and preventive checkups to family support, wellness programs,
        and premium hospital privileges, these plans ensure your workforce stays
        healthier, happier, and more engaged.
      </p>

      <h4 className="mt-10 lg:mt-25 text-[44px] font-semibold text-secondary-dark text-center">
        See Our Packages
      </h4>

      <div className="mt-5 lg:mt-10 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {activePackages.map((item) => (
          <CorporatePackageCard
            key={item.id}
            id={item.id}
            title={item.title}
            description={item.description}
            benefits={item.benefits || []}
            notices={item.notices || []}
            onApply={() =>
              onOpenCorporateRequest({ id: item.id, title: item.title })
            }
          />
        ))}
      </div>
      <div className="mt-10 lg:mt-25">
        <Corporate />
      </div>
    </div>
  );
}
