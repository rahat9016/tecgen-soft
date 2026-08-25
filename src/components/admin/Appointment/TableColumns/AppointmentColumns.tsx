import { ColumnDef } from "@/src/components/ui/data-table";
import { format } from "date-fns";
import { IAppointment } from "../types";

export const getAppointmentsColumns = (): ColumnDef<IAppointment>[] => [
  {
    header: "Appointment No",
    accessorKey: "appointNo",
  },
  {
    header: "Patient Name",
    accessorKey: "fullName",
    cell: (value, row) => (
      <span>{value?.toString().trim() || row.patientName?.trim() || "-"}</span>
    ),
  },
  {
    header: "Doctor ID",
    accessorKey: "doctorNo",
  },
  {
    header: "Doctor",
    accessorKey: "doctorName",
    cell: (value) => <span>{value?.toString().trim() || "-"}</span>,
  },
  {
    header: "Appointment Date",
    accessorKey: "appointDate",
    cell: (value) => {
      if (!value) return <span>-</span>;
      const date = new Date(value as string);
      return (
        <span>{isNaN(date.getTime()) ? "-" : format(date, "dd MMM yyyy")}</span>
      );
    },
  },
  {
    header: "Booking Type",
    accessorKey: "bookingType",
  },
];
