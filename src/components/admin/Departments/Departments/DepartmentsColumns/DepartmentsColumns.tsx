import StatusBadge from "@/src/components/shared/Status/Status";
import { Button } from "@/src/components/ui/button";
import { ColumnDef } from "@/src/components/ui/data-table";
import { StatusType } from "@/src/types/common/common";
import { SquarePen } from "lucide-react";
import { IDepartment } from "../../types";

export const getDepartmentColumns = (
  onView?: (department: IDepartment) => void,
  onEdit?: (department: IDepartment) => void
): ColumnDef<IDepartment>[] => [
  {
    header: "Department Name",
    accessorKey: "name",
    cell: (_value, row) => {
      const department = row as IDepartment;
      return <span>{department.name}</span>;
    },
  },

  {
    header: "Total Doctor",
    accessorKey: "_count",
    cell: (_value, row) => {
      const department = row as IDepartment;
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium">
          {department._count?.doctors || 0}
        </span>
      );
    },
  },

  {
    header: "Status",
    accessorKey: "status",
    cell: (_value, row) => {
      const department = row as IDepartment;
      return <StatusBadge status={department.status as StatusType} />;
    },
  },

  {
    header: "Actions",
    accessorKey: "actions",
    cell: (_value, row) => {
      const department = row as IDepartment;

      return (
        <Button
          className="w-9 h-9 bg-light hover:bg-light/90 text-secondary-foreground border border-[#E6E6E6] cursor-pointer"
          size="sm"
          onClick={() => onEdit?.(department)}
        >
          <SquarePen />
        </Button>
      );
    },
  },
];
