import { cn } from "@/src/lib/utils";
import {
  formatScheduleRange,
  getTodaySchedule,
} from "@/src/utils/doctorSchedule";
import { IDoctorSchedules } from "../admin/Doctors/types";

type DoctorScheduleBadgeProps = {
  schedules?: IDoctorSchedules[];
  className?: string;
};

export default function DoctorScheduleBadge({
  schedules,
  className,
}: DoctorScheduleBadgeProps) {
  const todaySchedule = getTodaySchedule(schedules);

  return (
    <span
      className={cn(
        "bg-[#5E5E7F] px-3 py-2.5 rounded-sm font-medium text-white flex items-center mt-3",
        className
      )}
    >
      {formatScheduleRange(todaySchedule)}
    </span>
  );
}
