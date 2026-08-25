import StatusBadge from "@/src/components/shared/Status/Status";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { StatusType } from "@/src/types/common/common";
import { SquarePen, Trash2 } from "lucide-react";
import Image from "next/image";
import { ColumnDef } from "../SpecialtyTable/specialty-data-table";
import { ISelectedDoctor, StatusValue } from "../types";

export const GetDoctorSectionColumns = (
  onRemove?: (doctorId: string) => void,
  onStatusChange?: (doctorId: string, status: StatusValue) => void
): ColumnDef<ISelectedDoctor>[] => {
  return [
    {
      header: "Image",
      accessorKey: "image",
      cell: (value) => {
        const imageUrl = value as string;
        return (
          <div className="relative w-10 h-10 rounded-lg overflow-hidden">
            <Image
              src={imageUrl || "/icons/doctor-placeholder.png"}
              alt="doctor"
              fill
              className="object-cover"
            />
          </div>
        );
      },
    },
    {
      header: "Full Name",
      accessorKey: "fullName",
    },
    {
      header: "Doctor ID",
      accessorKey: "doctorId",
    },
    {
      header: "Department",
      accessorKey: "department",
      cell: (value) => {
        const dept = (value as { name: string }) || {};
        return dept.name || "-";
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (value) => (
        <StatusBadge status={(value as StatusType) || StatusType.INACTIVE} />
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (_value, row) => {
        const doctor = row as ISelectedDoctor;

        return (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  className="w-9 max-h-9 bg-light hover:bg-light/90 text-secondary-foreground border border-[#E6E6E6] cursor-pointer"
                  size="sm"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                >
                  <SquarePen className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-30">
                {(["ACTIVE", "INACTIVE"] as const).map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => onStatusChange?.(doctor.id, status)}
                    className="text-secondary-foreground! font-normal text-sm hover:bg-primary/10! cursor-pointer"
                  >
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              type="button"
              className="w-9 max-h-9 bg-light hover:bg-light/90 text-secondary-foreground border border-[#E6E6E6] cursor-pointer"
              size="sm"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onRemove?.(doctor.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        );
      },
    },
  ];
};
