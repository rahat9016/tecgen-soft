import StatusBadge from "@/src/components/shared/Status/Status";
import { Button } from "@/src/components/ui/button";
import { ColumnDef } from "@/src/components/ui/data-table";
import { StatusType } from "@/src/types/common/common";
import { SquarePen } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IMediaImage } from "../types";

export const GetMediaImageColumns = (): ColumnDef<IMediaImage>[] => {
  const router = useRouter();

  return [
    {
      header: "Image",
      accessorKey: "imageUrl",
      cell: (_value, row) => {
        const mediaImage = row as IMediaImage;

        return (
          <div className="flex items-center gap-2">
            <Image
              width={36}
              height={36}
              src={mediaImage.imageUrl}
              alt="Media Image"
              className="w-9 h-9 rounded object-cover"
            />
          </div>
        );
      },
    },
    {
      header: "Updated Time",
      accessorKey: "updatedAt",
      cell: (value) => {
        const date = new Date(value as string);

        return (
          <span className="text-sm">
            {date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
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
        const mediaImage = row as IMediaImage;

        return (
          <div className="flex items-center gap-3">
            <Button
              className="w-9 max-h-9 bg-light hover:bg-light/90 text-secondary-foreground border border-[#E6E6E6]"
              size="sm"
              onClick={() =>
                router.push(`/admin/update-media-image/${mediaImage.id}`)
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
