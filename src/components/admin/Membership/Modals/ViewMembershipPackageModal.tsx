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
import { IMembershipPackage } from "../types";

export default function ViewMembershipPackageModal({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data?: IMembershipPackage;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white min-w-[65vw] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-secondary text-2xl font-semibold">
            Package Details
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between p-6 bg-light rounded-xl">
          <div>
            <Text className="lg:text-xl xl:text-2xl text-secondary-foreground font-semibold">
              {data?.title}
            </Text>
            <p className="text-sm text-gray-500 mt-1">{data?.description}</p>
          </div>
          <StatusBadge
            status={
              String(data?.status).toUpperCase() === StatusType.INACTIVE
                ? StatusType.INACTIVE
                : StatusType.ACTIVE
            }
          />
        </div>

        <div className="space-y-4">
          <Paragraph className="text-[#8A8A8A] font-medium">
            Benefits:
          </Paragraph>
          <ul className="list-disc pl-6 space-y-1 text-sm text-secondary-foreground">
            {(data?.benefits || []).map((benefit, index) => (
              <li key={`${benefit}-${index}`}>{benefit}</li>
            ))}
          </ul>

          <Paragraph className="text-[#8A8A8A] font-medium">Notices:</Paragraph>
          <ul className="list-disc pl-6 space-y-1 text-sm text-secondary-foreground">
            {(data?.notices || []).map((notice, index) => (
              <li key={`${notice}-${index}`}>{notice}</li>
            ))}
          </ul>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 gap-y-3">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
