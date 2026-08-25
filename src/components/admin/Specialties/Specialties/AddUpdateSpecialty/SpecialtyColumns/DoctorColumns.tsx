import { Button } from "@/src/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";
import { ColumnDef } from "../SpecialtyTable/specialty-data-table";
import { ISelectedDoctor } from "../types";

export const GetDoctorColumns = (
  onRemove?: (id: string) => void
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
      header: "Actions",
      accessorKey: "id",
      cell: (_value, row) => {
        const doctor = row as ISelectedDoctor;

        return (
          <Button
            type="button"
            className="w-9 max-h-9 bg-light hover:bg-light/90 text-red-500 border border-[#E6E6E6] cursor-pointer"
            size="sm"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onRemove?.(doctor.id);
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        );
      },
    },
  ];
};
