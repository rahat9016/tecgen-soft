import StatusBadge from "@/src/components/shared/Status/Status";
import { Button } from "@/src/components/ui/button";
import { ColumnDef } from "@/src/components/ui/data-table";
import { StatusType } from "@/src/types/common/common";
import { SquarePen } from "lucide-react";
import { useRouter } from "next/navigation";
import { ISpecialty } from "../../types";

export const GetSpecialtiesColumns = (): ColumnDef<ISpecialty>[] => {
  const router = useRouter();
  return [
    {
      header: "Name",
      accessorKey: "title",
    },
    {
      header: "Description",
      accessorKey: "description",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (_value, row) => {
        const specialty = row as ISpecialty;
        return <StatusBadge status={specialty.status as StatusType} />;
      },
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (_value, row) => {
        const specialty = row as ISpecialty;

        return (
          <div className="flex items-center gap-3">
            <Button
              className="w-9 max-h-9 bg-light hover:bg-light/90 text-secondary-foreground border border-[#E6E6E6] cursor-pointer"
              size="sm"
              onClick={() =>
                router.push(`/admin/update-specialties/${specialty.id}`)
              }
            >
              <SquarePen />
            </Button>
          </div>
        );
      },
    },
  ];
};
