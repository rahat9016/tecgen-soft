"use client";

import { DataTable } from "@/src/components/ui/data-table";
import { useGet } from "@/src/hooks/useGet";

import { getAppointmentsColumns } from "../Appointment/TableColumns/AppointmentColumns";
import { IAppointment } from "../Appointment/types";

const RECENT_APPOINTMENTS_LIMIT = 5;

const AppointmentsOverviewTable = () => {
  const { data, isLoading } = useGet<IAppointment[]>(
    "/appointed-patient/recent",
    ["recent-appointments"],
    { limit: RECENT_APPOINTMENTS_LIMIT }
  );

  const appointments = Array.isArray(data?.data) ? data.data : [];

  return (
    <div>
      <DataTable
        columns={getAppointmentsColumns()}
        data={appointments}
        isLoading={isLoading}
        totalItems={appointments.length}
        currentPage={1}
        itemsPerPage={RECENT_APPOINTMENTS_LIMIT}
        onPageChange={() => {}}
        setItemsPerPage={undefined}
        tableTitle="Recent Appointments"
        showSearch={false}
        isShowStatus={false}
        showTopBar={false}
        showPagination={false}
      />
    </div>
  );
};

export default AppointmentsOverviewTable;
