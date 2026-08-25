import StatusBadge from "@/src/components/shared/Status/Status";
import { Button } from "@/src/components/ui/button";
import { StatusType } from "@/src/types/common/common";
import { SquarePen, Trash2 } from "lucide-react";
import { ColumnDef } from "../SpecialtyTable/specialty-data-table";
import { ISectionItem } from "../types";

export const GetSectionThreeColumns = (
  onEdit?: (item: ISectionItem) => void,
  onDelete?: (item: ISectionItem) => void
): ColumnDef<ISectionItem>[] => {
  return [
    {
      header: "Title",
      accessorKey: "title",
    },
    {
      header: "Description",
      accessorKey: "description",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (value) => {
        return (
          <StatusBadge status={(value as StatusType) || StatusType.INACTIVE} />
        );
      },
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (_value, row) => {
        const healthPk = row as ISectionItem;

        return (
          <div className="flex items-center gap-3">
            <Button
              type="button"
              className="w-9 max-h-9 bg-light hover:bg-light/90 text-secondary-foreground border border-[#E6E6E6] cursor-pointer"
              size="sm"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onEdit?.(healthPk);
              }}
            >
              <SquarePen />
            </Button>
            <Button
              type="button"
              className="w-9 max-h-9 bg-light hover:bg-light/90 text-secondary-foreground border border-[#E6E6E6] cursor-pointer"
              size="sm"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onDelete?.(healthPk);
              }}
            >
              <Trash2 />
            </Button>
          </div>
        );
      },
    },
  ];
};
