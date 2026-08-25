import { Button } from "@/src/components/ui/button";
import { SquarePen, Trash2 } from "lucide-react";

import StatusBadge from "@/src/components/shared/Status/Status";
import { StatusType } from "@/src/types/common/common";
import { CorporateEmployeeColumnDef } from "../Table/CorporateEmployeeTable";
import { ICorporateEmployee } from "../types";

type EmployeeColumnsParams = {
  onEdit: (rowIndex: number) => void;
  onDelete: (rowIndex: number) => void;
};

export const employeeColumns = ({
  onEdit,
  onDelete,
}: EmployeeColumnsParams): CorporateEmployeeColumnDef<ICorporateEmployee>[] => [
  { header: "Employee ID", accessorKey: "employeeId" },
  { header: "Name", accessorKey: "name" },
  { header: "Designation", accessorKey: "designation" },
  { header: "Phone", accessorKey: "phone" },
  { header: "Email", accessorKey: "email" },
  {
    header: "Status",
    accessorKey: "status",
    cell: (value) => <StatusBadge status={String(value) as StatusType} />,
  },
  {
    header: "Actions",
    accessorKey: "employeeId",
    cell: (_value, _row, rowIndex) => (
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          className="w-9 h-9 bg-light hover:bg-light/90 text-secondary-foreground border border-[#E6E6E6]"
          onClick={() => onEdit(rowIndex)}
        >
          <SquarePen className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          className="w-9 h-9 bg-[#FEF3F2] hover:bg-[#FEF3F2] text-red-500 border border-[#FDDDD9]"
          onClick={() => onDelete(rowIndex)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ),
  },
];
