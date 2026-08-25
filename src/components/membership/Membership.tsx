"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import MembershipRequestModal from "@/src/components/membership/MembershipRequestModal";
import { useGet } from "@/src/hooks/useGet";
import { StatusType } from "@/src/types/common/common";
import DynamicBreadcrumb from "../shared/DynamicBreadcrumb";
import HeroSection from "../shared/HeroSection/HeroSection";
import CorporateMembershipRequestModal from "./CorporateMembershipRequestModal";
import MembershipContent from "./MembershipContent";
import MembershipTypeRadioGroup from "./MembershipTypeRadioGroup";
import {
  CorporatePackage,
  CorporatePackageSelection,
  MembershipType,
} from "./types";

export default function Membership() {
  const [membershipType, setMembershipType] =
    useState<MembershipType>("general");
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isCorporateRequestOpen, setIsCorporateRequestOpen] = useState(false);
  const [selectedCorporatePackage, setSelectedCorporatePackage] =
    useState<CorporatePackageSelection | null>(null);

  const { data: packageResponse } = useGet<CorporatePackage[]>("/package", [
    "corporate-membership-packages",
  ]);

  const activePackages = (packageResponse?.data || []).filter(
    (item) => String(item.status).toUpperCase() === StatusType.ACTIVE
  );

  return (
    <div className="pb-16">
      <HeroSection
        image="/heroImages/bg.jpg"
        title="Membership"
        description="Join our membership programs and enjoy exclusive benefits, priority services, and up to 50% savings on healthcare costs."
      />

      <div className="container mt-3 lg:mt-6">
        <div className="mb-5 lg:mb-10">
          <DynamicBreadcrumb />
        </div>
        <div>
          <MembershipTypeRadioGroup
            membershipType={membershipType}
            setMembershipType={setMembershipType}
          />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={membershipType}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <MembershipContent
                membershipType={membershipType}
                activePackages={activePackages}
                onOpenGeneralRequest={() => setIsRequestOpen(true)}
                onOpenCorporateRequest={(item) => {
                  setSelectedCorporatePackage(item);
                  setIsCorporateRequestOpen(true);
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <MembershipRequestModal
        open={isRequestOpen}
        onOpenChange={setIsRequestOpen}
      />

      <CorporateMembershipRequestModal
        open={isCorporateRequestOpen}
        onOpenChange={setIsCorporateRequestOpen}
        packageId={selectedCorporatePackage?.id}
        packageTitle={selectedCorporatePackage?.title}
      />
    </div>
  );
}
