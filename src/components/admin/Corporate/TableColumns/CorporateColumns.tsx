import StatusBadge from "@/src/components/shared/Status/Status";
import { Button } from "@/src/components/ui/button";
import { ColumnDef } from "@/src/components/ui/data-table";
import { StatusType } from "@/src/types/common/common";
import { SquarePen } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ICorporate } from "../types";

export const GetCorporateColumns = (): ColumnDef<ICorporate>[] => {
  const router = useRouter();

  return [
    {
      header: "Logo",
      accessorKey: "imageUrl",
      cell: (_value, row) => {
        const corporate = row as ICorporate;

        return (
          <div className="flex items-center gap-2">
            <Image
              width={36}
              height={36}
              src={corporate.imageUrl}
              alt={corporate.name}
              className="w-9 h-9 rounded-full object-cover border border-[#E6E6E6]"
            />
          </div>
        );
      },
    },

    {
      header: "Company Name",
      accessorKey: "name",
    },

    {
      header: "Website",
      accessorKey: "url",
      cell: (value) => {
        return (
          <a
            href={value as string}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline text-sm"
          >
            {value as string}
          </a>
        );
      },
    },
    {
      header: "Description",
      accessorKey: "description",
    },

    {
      header: "Status",
      accessorKey: "status",
      cell: (value) => {
        const statusValue =
          String(value).toUpperCase() === StatusType.INACTIVE
            ? StatusType.INACTIVE
            : StatusType.ACTIVE;
        return <StatusBadge status={statusValue} />;
      },
    },

    {
      header: "Actions",
      accessorKey: "id",
      cell: (value) => {
        return (
          <div className="flex items-center gap-3">
            <Button
              className="w-9 max-h-9 bg-light hover:bg-light/90 text-secondary-foreground border border-[#E6E6E6]"
              size="sm"
              onClick={() =>
                router.push(
                  `/admin/corporate/update-corporate-services/${value}`
                )
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
