"use client";
import { useGet } from "@/src/hooks/useGet";
import { usePagination } from "@/src/hooks/usePagination";
import AppointmentsTable from "../AppointmentsTable";
import { getAppointmentsColumns } from "../TableColumns/AppointmentColumns";
import { IAppointment } from "../types";

export default function Appointment() {
  const {
    setCurrentPage,
    itemsPerPage,
    currentPage,
    totalItems,
    setItemsPerPage,
  } = usePagination();
  const { data, isLoading } = useGet<IAppointment[]>("/appointed-patient", [
    "appointments",
  ]);

  const columns = getAppointmentsColumns();
  return (
    <div>
      <AppointmentsTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        totalItems={totalItems}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
        showSearch={false}
      />
    </div>
  );
}
