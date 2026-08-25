import { cn } from "@/src/lib/utils";
import { StatusType } from "@/src/types/common/common";
import { StatusBadgeProps } from "./types";

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusStyles: Record<StatusType, string> = {
    [StatusType.COMPLETED]: "text-[#28A745] bg-[#ECFDF3]",
    [StatusType.ACTIVE]: "text-[#28A745] bg-[#ECFDF3]",
    [StatusType.PENDING]: "text-[#F79009] bg-[#FFFAEB]",
    [StatusType.CANCELLED]: "text-[#F04438] bg-[#FEF3F2]",
    [StatusType.REJECTED]: "text-[#F04438] bg-[#FEF3F2]",
    [StatusType.INACTIVE]: "text-[#F04438] bg-[#FEF3F2]",
    [StatusType.IN_PROGRESS]: "text-[#3F3E66] bg-[#E7E7EC]",
    [StatusType.RESOLVED]: "text-[#28A745] bg-[#ECFDF3]",
    [StatusType.ON_LEAVE]: "text-[#F04438] bg-[#FEF3F2]",
  };

  return (
    <span
      className={cn(
        `px-3 py-2 rounded-full text-sm font-medium inline-flex items-center capitalize ${statusStyles[status]}`,
        className
      )}
    >
      {status.toLocaleLowerCase().replace("_", " ")}
    </span>
  );
}
