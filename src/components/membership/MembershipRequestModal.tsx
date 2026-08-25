"use client";

import { Dialog } from "../ui/dialog";
import GeneralMembershipRequestForm from "./Form/GeneralMembershipRequestForm";

type MembershipRequestModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function MembershipRequestModal({
  open,
  onOpenChange,
}: MembershipRequestModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <GeneralMembershipRequestForm open={open} onOpenChange={onOpenChange} />
    </Dialog>
  );
}
