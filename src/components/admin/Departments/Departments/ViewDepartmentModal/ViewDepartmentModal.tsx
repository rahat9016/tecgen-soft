import Paragraph from "@/src/components/shared/Paragraph";
import StatusBadge from "@/src/components/shared/Status/Status";
import Text from "@/src/components/shared/Text";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { StatusType } from "@/src/types/common/common";
import { formatDate } from "@/src/utils/formatDate";
import { SquarePen } from "lucide-react";
import { IDepartment } from "../../types";

export default function ViewDepartmentModal({
  isOpen,
  onClose,
  data,
  onEdit,
}: {
  isOpen: boolean;
  onClose: () => void;
  data?: IDepartment;
  onEdit?: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white min-w-[60vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-secondary text-2xl font-semibold">
            Department Details
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between p-6 bg-light rounded-xl">
          <div>
            <Text className="lg:text-xl xl:text-2xl text-secondary-foreground font-semibold">
              {data?.name}
            </Text>
            <p className="text-sm text-gray-500 mt-1">{data?.description}</p>
          </div>
          <StatusBadge status={data?.status as StatusType} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 gap-y-3">
          <Paragraph className="text-[#8A8A8A] font-medium">
            Total Doctors:
            <span className="font-normal ml-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
              {data?._count?.doctors || 0}
            </span>
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
          <Paragraph className="text-[#8A8A8A] font-medium">
            Status:{" "}
            <span className="font-normal">
              {data?.status === "ACTIVE" ? "Active" : "Inactive"}
            </span>
          </Paragraph>
        </div>

        <Button
          className="w-40 lg:w-49.75 h-11 text-sm  md:text-base font-medium"
          onClick={onEdit}
          disabled={!data}
        >
          <SquarePen />
          Update Details
        </Button>
      </DialogContent>
    </Dialog>
  );
}
