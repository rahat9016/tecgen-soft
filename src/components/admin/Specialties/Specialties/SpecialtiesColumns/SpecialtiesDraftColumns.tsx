import StatusBadge from "@/src/components/shared/Status/Status";
import { Button } from "@/src/components/ui/button";
import { ColumnDef } from "@/src/components/ui/data-table";
import { StatusType } from "@/src/types/common/common";
import { ISpecialtyDraftRecord } from "@/src/utils/indexeddb/specialtyDraft";
import { SquarePen, Trash2 } from "lucide-react";

interface GetSpecialtiesDraftColumnsProps {
  onEdit: (draft: ISpecialtyDraftRecord) => void;
  onDelete: (draft: ISpecialtyDraftRecord) => void;
}

export const GetSpecialtiesDraftColumns = ({
  onEdit,
  onDelete,
}: GetSpecialtiesDraftColumnsProps): ColumnDef<ISpecialtyDraftRecord>[] => {
  return [
    {
      header: "Name",
      accessorKey: "title",
    },
    {
      header: "Description",
      accessorKey: "payload",
      cell: (_value, row) => row.payload?.hero?.description || "--",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (_value, row) => {
        return <StatusBadge status={row.status as StatusType} />;
      },
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (_value, row) => {
        return (
          <div className="flex items-center gap-3">
            <Button
              type="button"
              className="w-9 max-h-9 bg-light hover:bg-light/90 text-secondary-foreground border border-[#E6E6E6] cursor-pointer"
              size="sm"
              onClick={() => onEdit(row)}
            >
              <SquarePen />
            </Button>
            <Button
              type="button"
              className="w-9 max-h-9 bg-light hover:bg-light/90 text-secondary-foreground border border-[#E6E6E6] cursor-pointer"
              size="sm"
              onClick={() => onDelete(row)}
            >
              <Trash2 />
            </Button>
          </div>
        );
      },
    },
  ];
};
