"use client";

import CorporateMembershipRequestForm from "@/src/components/membership/CorporateMembershipRequestForm";
import { Dialog } from "../ui/dialog";

type CorporateMembershipRequestModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageId?: string;
  packageTitle?: string;
};

export default function CorporateMembershipRequestModal({
  open,
  onOpenChange,
  packageId,
  packageTitle,
}: CorporateMembershipRequestModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <CorporateMembershipRequestForm
        open={open}
        onOpenChange={onOpenChange}
        packageId={packageId}
        packageTitle={packageTitle}
      />
    </Dialog>
  );
}
