import StatusBadge from "@/src/components/shared/Status/Status";
import { Button } from "@/src/components/ui/button";
import { ColumnDef } from "@/src/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { StatusType } from "@/src/types/common/common";
import { format } from "date-fns";
import { SquarePen } from "lucide-react";
import { ISupportTicket } from "../types";
export const GetSupportColumns = (
  onStatusChange?: (id: string, newStatus: StatusType) => void
): ColumnDef<ISupportTicket>[] => [
  {
    header: "Ticket ID",
    accessorKey: "id",
  },
  {
    header: "Date & Time",
    accessorKey: "createdAt",
    cell: (value: string | number | undefined) => {
      const date = new Date(value as string);
      return <span>{format(date, "dd MMM yyyy, hh:mm a")}</span>;
    },
  },
  {
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "Phone Number",
    accessorKey: "phone",
  },
  {
    header: "Email",
    accessorKey: "email",
  },
  {
    header: "Message Preview",
    accessorKey: "message",
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: (status) => {
      return <StatusBadge status={status as StatusType} />;
    },
  },
  {
    header: "Action",
    accessorKey: "id",
    cell: (id) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-9 max-h-9 bg-light hover:bg-light/90 text-secondary-foreground border border-[#E6E6E6] cursor-pointer">
              <SquarePen className="text-lg text-secondary-foreground" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-30">
            {[
              StatusType.PENDING,
              StatusType.IN_PROGRESS,
              StatusType.RESOLVED,
            ].map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => onStatusChange?.(id, status)}
                className="text-secondary-foreground! font-normal text-sm hover:bg-primary/10! cursor-pointer"
              >
                {status
                  .replace("_", " ")
                  .toLocaleLowerCase()
                  .replace(/\b\w/g, (char) => char.toUpperCase())}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
