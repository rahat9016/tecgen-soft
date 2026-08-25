import { IBlog } from "@/src/components/blogs/types";
import StatusBadge from "@/src/components/shared/Status/Status";
import { Button } from "@/src/components/ui/button";
import { ColumnDef } from "@/src/components/ui/data-table";
import { StatusType } from "@/src/types/common/common";
import { sanitizeToPlainText } from "@/src/utils/sanitize";
import { SquarePen } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export const GetBlogColumns = (): ColumnDef<IBlog>[] => {
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
      cell: (value) => {
        return <span>{sanitizeToPlainText(value as string)}</span>;
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
        const healthPk = row as IBlog;

        return (
          <div className="flex items-center gap-3">
            <Button
              className="w-9 max-h-9 bg-light hover:bg-light/90 text-secondary-foreground border border-[#E6E6E6] cursor-pointer"
              size="sm"
              onClick={() => router.push(`/admin/blog/${healthPk.id}`)}
            >
              <SquarePen />
            </Button>
          </div>
        );
      },
    },
  ];
};
