import { IHealthCheckPackage } from "@/src/components/health-check/types";
import StatusBadge from "@/src/components/shared/Status/Status";
import { Button } from "@/src/components/ui/button";
import { ColumnDef } from "@/src/components/ui/data-table";
import { StatusType } from "@/src/types/common/common";
import { Eye, SquarePen } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export const GetHealthPackageColumns = (
  onView?: (doctor: IHealthCheckPackage) => void
): ColumnDef<IHealthCheckPackage>[] => {
  const router = useRouter();

  return [
    {
      header: "Cover",
      accessorKey: "image",
      cell: (_value, row) => {
        return (
          <div className="flex items-center gap-2">
            <Image
              width={36}
              height={36}
              src={row.image}
              alt={row.title}
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
    },
    {
      header: "Price",
      accessorKey: "price",
      cell: (value) => {
        return `${value} BDT`;
      },
    },

    {
      header: "Status",
      accessorKey: "status",
      cell: (_value, row) => {
        const healthPackage = row as IHealthCheckPackage;
        return <StatusBadge status={healthPackage.status as StatusType} />;
      },
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (_value, row) => {
        const healthPk = row as IHealthCheckPackage;

        return (
          <div className="flex items-center gap-3">
            <Button
              className="w-9 max-h-9 bg-light hover:bg-light/90 text-secondary-foreground border border-[#E6E6E6] cursor-pointer"
              size="sm"
              onClick={() => onView?.(healthPk)}
            >
              <Eye />
            </Button>
            <Button
              className="w-9 max-h-9 bg-light hover:bg-light/90 text-secondary-foreground border border-[#E6E6E6] cursor-pointer"
              size="sm"
              onClick={() =>
                router.push(`/admin/health-package-update/${healthPk.id}`)
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
