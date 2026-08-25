import StatusBadge from "@/src/components/shared/Status/Status";
import { Button } from "@/src/components/ui/button";
import { ColumnDef } from "@/src/components/ui/data-table";
import { StatusType } from "@/src/types/common/common";
import { formatEmploymentType } from "@/src/utils/careerFormatters";
import { sanitizeToPlainText } from "@/src/utils/sanitize";
import { Eye, SquarePen } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ICareer } from "../types";

export const GetCareerColumns = (
  onView?: (doctor: ICareer) => void
): ColumnDef<ICareer>[] => {
  const router = useRouter();

  return [
    {
      header: "Image",
      accessorKey: "image",
      cell: (_value, row) => {
        const career = row as ICareer;

        return (
          <div className="flex items-center gap-2">
            <Image
              width={36}
              height={36}
              src={career.image}
              alt={career.title}
              className="w-9 h-9 rounded object-cover"
            />
          </div>
        );
      },
    },
    {
      header: "Title",
      accessorKey: "title",
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: (value) => {
        return <span>{sanitizeToPlainText((value as string) || "")}</span>;
      },
    },

    {
      header: "Job Type",
      accessorKey: "jobType",
      cell: (value) => {
        return <span>{formatEmploymentType(value as string)}</span>;
      },
    },

    {
      header: "Experience",
      accessorKey: "experience",
    },

    {
      header: "Vacancy",
      accessorKey: "vacancy",
    },

    {
      header: "Location",
      accessorKey: "location",
    },

    {
      header: "Deadline",
      accessorKey: "deadline",
      cell: (value) => {
        const date = new Date(value as string);

        return (
          <span className="text-sm">
            {date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        );
      },
    },

    {
      header: "Status",
      accessorKey: "status",
      cell: (value) => {
        return <StatusBadge status={value as StatusType} />;
      },
    },

    {
      header: "Actions",
      accessorKey: "actions",
      cell: (_value, row) => {
        const career = row as ICareer;

        return (
          <div className="flex items-center gap-3">
            <Button
              className="w-9 max-h-9 bg-light hover:bg-light/90 text-secondary-foreground border border-[#E6E6E6] cursor-pointer"
              size="sm"
              onClick={() => onView?.(career)}
            >
              <Eye />
            </Button>
            <Button
              className="w-9 max-h-9 bg-light hover:bg-light/90 text-secondary-foreground border border-[#E6E6E6]"
              size="sm"
              onClick={() => router.push(`/admin/update-career/${career.id}`)}
            >
              <SquarePen />
            </Button>
          </div>
        );
      },
    },
  ];
};
