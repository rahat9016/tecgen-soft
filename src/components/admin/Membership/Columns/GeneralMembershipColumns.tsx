import StatusBadge from "@/src/components/shared/Status/Status";
import { Button } from "@/src/components/ui/button";
import { ColumnDef } from "@/src/components/ui/data-table";
import { StatusType } from "@/src/types/common/common";
import { Eye, SquarePen } from "lucide-react";
import { IGeneralMembership } from "../types";

export const GetGeneralMembershipColumns = ({
  onView,
  onEdit,
}: {
  onView?: (item: IGeneralMembership) => void;
  onEdit?: (item: IGeneralMembership) => void;
}): ColumnDef<IGeneralMembership>[] => {
  return [
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Gender",
      accessorKey: "gender",
    },
    {
      header: "Contact",
      accessorKey: "contactNumber",
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Blood Group",
      accessorKey: "bloodGroup",
    },
    {
      header: "Discount",
      accessorKey: "discount",
      cell: (value) => {
        const discountValue = typeof value === "number" ? value : 0;
        return <span>{discountValue}%</span>;
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (value) => {
        return (
          <StatusBadge status={String(value).toUpperCase() as StatusType} />
        );
      },
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (_value, row) => {
        const membership = row as IGeneralMembership;

        return (
          <div className="flex items-center gap-3">
            <Button
              className="w-9 max-h-9 bg-light hover:bg-light/90 text-secondary-foreground border border-[#E6E6E6] cursor-pointer"
              size="sm"
              onClick={() => onView?.(membership)}
            >
              <Eye />
            </Button>
            <Button
              className="w-9 max-h-9 bg-light hover:bg-light/90 text-secondary-foreground border border-[#E6E6E6] cursor-pointer"
              size="sm"
              onClick={() => onEdit?.(membership)}
            >
              <SquarePen />
            </Button>
          </div>
        );
      },
    },
  ];
};
