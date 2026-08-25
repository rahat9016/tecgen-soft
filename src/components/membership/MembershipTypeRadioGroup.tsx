import { LayoutGroup, motion } from "framer-motion";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { MembershipType } from "./types";

export default function MembershipTypeRadioGroup({
  membershipType,
  setMembershipType,
}: {
  membershipType: MembershipType;
  setMembershipType: (value: MembershipType) => void;
}) {
  return (
    <LayoutGroup>
      <RadioGroup
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
        value={membershipType}
        onValueChange={(value) => setMembershipType(value as MembershipType)}
      >
        <Label
          htmlFor="general-membership"
          className={`relative cursor-pointer border rounded-[16px] p-6 h-20 flex items-center gap-2 overflow-hidden bg-white transition-colors duration-200 ${
            membershipType === "general"
              ? "border-[#2BBEC4]"
              : "border-light-silver"
          }`}
        >
          {membershipType === "general" ? (
            <motion.div
              layoutId="membership-type-active"
              className="absolute inset-0 bg-[#2BBEC4]/8"
              transition={{ type: "spring", stiffness: 450, damping: 36 }}
            />
          ) : null}
          <RadioGroupItem value="general" id="general-membership" />
          <span className="relative z-10 text-xl font-medium text-secondary-foreground transition-colors duration-200">
            General Membership
          </span>
        </Label>

        <Label
          htmlFor="corporate-membership"
          className={`relative cursor-pointer border rounded-[16px] p-6 h-20 flex items-center gap-2 overflow-hidden bg-white transition-colors duration-200 ${
            membershipType === "corporate"
              ? "border-[#2BBEC4]"
              : "border-light-silver"
          }`}
        >
          {membershipType === "corporate" ? (
            <motion.div
              layoutId="membership-type-active"
              className="absolute inset-0 bg-[#2BBEC4]/8"
              transition={{ type: "spring", stiffness: 450, damping: 36 }}
            />
          ) : null}
          <RadioGroupItem value="corporate" id="corporate-membership" />
          <span className="relative z-10 text-xl font-medium text-secondary-foreground transition-colors duration-200">
            Corporate Membership
          </span>
        </Label>
      </RadioGroup>
    </LayoutGroup>
  );
}
