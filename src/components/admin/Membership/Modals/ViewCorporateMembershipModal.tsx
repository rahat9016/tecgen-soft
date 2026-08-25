import Paragraph from "@/src/components/shared/Paragraph";
import StatusBadge from "@/src/components/shared/Status/Status";
import Text from "@/src/components/shared/Text";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { StatusType } from "@/src/types/common/common";
import { formatDate } from "@/src/utils/formatDate";
import { ICorporateMembership } from "../types";

export default function ViewCorporateMembershipModal({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data?: ICorporateMembership;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white min-w-[65vw] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-secondary text-2xl font-semibold">
            Corporate Membership Details
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between p-6 bg-light rounded-xl">
          <div>
            <Text className="lg:text-xl xl:text-2xl text-secondary-foreground font-semibold">
              {data?.companyName}
            </Text>
            <p className="text-sm text-gray-500 mt-1">{data?.email}</p>
          </div>
          <StatusBadge
            status={
              String(data?.status).toUpperCase() === StatusType.INACTIVE
                ? StatusType.INACTIVE
                : StatusType.ACTIVE
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 gap-y-3">
          <Paragraph className="text-[#8A8A8A] font-medium">
            Contact Person:{" "}
            <span className="font-normal">{data?.contactPerson || "N/A"}</span>
          </Paragraph>
          <Paragraph className="text-[#8A8A8A] font-medium">
            Contact Number:{" "}
            <span className="font-normal">{data?.contactNumber || "N/A"}</span>
          </Paragraph>
          <Paragraph className="text-[#8A8A8A] font-medium">
            Total Employees:{" "}
            <span className="font-normal">{data?.totalEmployees ?? "N/A"}</span>
          </Paragraph>
          <Paragraph className="text-[#8A8A8A] font-medium">
            Trade License:{" "}
            <span className="font-normal">{data?.tradeLicense || "N/A"}</span>
          </Paragraph>
          <Paragraph className="text-[#8A8A8A] font-medium">
            Package:{" "}
            <span className="font-normal">
              {data?.package?.title || data?.packageId || "N/A"}
            </span>
          </Paragraph>
          <Paragraph className="text-[#8A8A8A] font-medium">
            Discount:{" "}
            <span className="font-normal">{data?.discount ?? 0}%</span>
          </Paragraph>
          <Paragraph className="text-[#8A8A8A] font-medium">
            Created At:{" "}
            <span className="font-normal">
              {data?.createdAt ? formatDate(data.createdAt) : "N/A"}
            </span>
          </Paragraph>
          <Paragraph className="text-[#8A8A8A] font-medium">
            Updated At:{" "}
            <span className="font-normal">
              {data?.updatedAt ? formatDate(data.updatedAt) : "N/A"}
            </span>
          </Paragraph>
        </div>
      </DialogContent>
    </Dialog>
  );
}
