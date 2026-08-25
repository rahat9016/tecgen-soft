import StatusBadge from "@/src/components/shared/Status/Status";
import { Button } from "@/src/components/ui/button";
import { ColumnDef } from "@/src/components/ui/data-table";
import { StatusType } from "@/src/types/common/common";
import { Eye, SquarePen } from "lucide-react";
import { IMembershipPackage } from "../types";

export const GetMembershipPackageColumns = ({
  onView,
  onEdit,
}: {
  onView?: (item: IMembershipPackage) => void;
  onEdit?: (item: IMembershipPackage) => void;
}): ColumnDef<IMembershipPackage>[] => {
  const renderListPreview = (value: unknown) => {
    const items = Array.isArray(value)
      ? value.filter(
          (item): item is string =>
            typeof item === "string" && item.trim() !== ""
        )
      : [];

    const visibleItems = items.slice(0, 3);
    const remainingCount = items.length - visibleItems.length;

    if (visibleItems.length === 0) {
      return <span>-</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {visibleItems.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="truncate  px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium"
          >
            {item}
          </span>
        ))}
        {remainingCount > 0 && (
          <span className="w-fit  px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">
            +{remainingCount} more
          </span>
        )}
      </div>
    );
  };

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
      header: "Benefits",
      accessorKey: "benefits",
      cell: (value) => {
        return renderListPreview(value);
      },
    },
    {
      header: "Notices",
      accessorKey: "notices",
      cell: (value) => {
        return renderListPreview(value);
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (value) => {
        return (
          <StatusBadge
            status={
              String(value).toUpperCase() === StatusType.INACTIVE
                ? StatusType.INACTIVE
                : StatusType.ACTIVE
            }
          />
        );
      },
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (_value, row) => {
        const pkg = row as IMembershipPackage;

        return (
          <div className="flex items-center gap-3">
            <Button
              className="w-9 max-h-9 bg-light hover:bg-light/90 text-secondary-foreground border border-[#E6E6E6] cursor-pointer"
              size="sm"
              onClick={() => onView?.(pkg)}
            >
              <Eye />
            </Button>
            <Button
              className="w-9 max-h-9 bg-light hover:bg-light/90 text-secondary-foreground border border-[#E6E6E6] cursor-pointer"
              size="sm"
              onClick={() => onEdit?.(pkg)}
            >
              <SquarePen />
            </Button>
          </div>
        );
      },
    },
  ];
};
