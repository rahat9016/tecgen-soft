import StatusBadge from "@/src/components/shared/Status/Status";
import { Button } from "@/src/components/ui/button";
import { ColumnDef } from "@/src/components/ui/data-table";
import { StatusType } from "@/src/types/common/common";
import { SquarePen } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IMediaVideo } from "../types";

export const GetMediaVideoColumns = (): ColumnDef<IMediaVideo>[] => {
  const router = useRouter();

  return [
    {
      header: "Video Thumbnail",
      accessorKey: "videoThumbnail",
      cell: (_value, row) => {
        const mediaVideo = row as IMediaVideo;

        return (
          <div className="flex items-center gap-2">
            <Image
              width={36}
              height={36}
              src={
                mediaVideo.videoThumbnail ||
                mediaVideo.thumbnail ||
                "/icons/media.svg"
              }
              alt="Media Image"
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
      header: "Link",
      accessorKey: "url",
      cell: (value) => (
        <a
          href={value as string}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          {value}
        </a>
      ),
    },
    {
      header: "Duration",
      accessorKey: "duration",
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
        const mediaVideo = row as IMediaVideo;

        return (
          <div className="flex items-center gap-3">
            <Button
              className="w-9 max-h-9 bg-light hover:bg-light/90 text-secondary-foreground border border-[#E6E6E6]"
              size="sm"
              onClick={() =>
                router.push(`/admin/update-media-video/${mediaVideo.id}`)
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
