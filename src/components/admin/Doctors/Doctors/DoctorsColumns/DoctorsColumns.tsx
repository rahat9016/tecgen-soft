import StatusBadge from "@/src/components/shared/Status/Status";
import { Button } from "@/src/components/ui/button";
import { ColumnDef } from "@/src/components/ui/data-table";
import { StatusType } from "@/src/types/common/common";
import { Eye, SquarePen } from "lucide-react";
import { useRouter } from "next/navigation";
import { IDoctor } from "../../types";
import { DoctorAvatar } from "./DoctorAvatar";

export const GetDoctorColumns = (
  onView?: (doctor: IDoctor) => void
): ColumnDef<IDoctor>[] => {
  const router = useRouter();

  return [
    {
      header: "Doctor ID",
      accessorKey: "doctorId",
    },

    {
      header: "Doctor Name",
      accessorKey: "fullName",
      cell: (_value, row) => {
        const doctor = row as IDoctor;

        return (
          <div className="flex items-center gap-2">
            <DoctorAvatar doctor={doctor} />
            <span>{doctor.fullName}</span>
          </div>
        );
      },
    },

    {
      header: "Department",
      accessorKey: "department",
      cell: (_value, row) => {
        const doctor = row as IDoctor;
        return <span>{doctor.department?.name}</span>;
      },
    },

    {
      header: "Booking Type",
      accessorKey: "bookingType",
      cell: (_value, row) => {
        const doctor = row as IDoctor;
        const type = doctor.bookingType;

        const styles: Record<string, string> = {
          ONSITE: "text-[#33AEB3] border-[#33AEB3]",
          TELE_ONLINE: "text-[#F79009] border-[#F79009]",
        };

        return (
          <span
            className={`px-3 py-1 rounded-full border text-xs font-medium whitespace-nowrap capitalize ${
              styles[type] || "text-gray-500 border-gray-300"
            }`}
          >
            {type.toLowerCase().replace("_", " ")}
          </span>
        );
      },
    },

    {
      header: "Status",
      accessorKey: "status",
      cell: (_value, row) => {
        const doctor = row as IDoctor;
        return <StatusBadge status={doctor.status as StatusType} />;
      },
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (_value, row) => {
        const doctor = row as IDoctor;

        return (
          <div className="flex items-center gap-2">
            <Button
              className="w-9 max-h-9 bg-light hover:bg-light/90 text-secondary-foreground border border-[#E6E6E6] cursor-pointer"
              size="sm"
              onClick={() => onView?.(doctor)}
            >
              <Eye size={16} />
            </Button>
            <Button
              className="w-9 max-h-9 bg-light hover:bg-light/90 text-secondary-foreground border border-[#E6E6E6] cursor-pointer"
              size="sm"
              onClick={() =>
                router.push(
                  `/admin/doctors/add-update-doctor/${doctor.doctorId}`
                )
              }
            >
              <SquarePen size={16} />
            </Button>
          </div>
        );
      },
    },
  ];
};
