"use client";

import { DataTable } from "@/src/components/ui/data-table";
import { ITableProps } from "@/src/types/common/common";
import { FileCog } from "lucide-react";

const AppointmentsTable = <T,>({
  columns,
  data,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  itemsPerPage = 10,
  setCurrentPage,
  setItemsPerPage,
  search = "",
  showSearch,
  handleSearchChange,
  setIsModalOpen,
  showCreateButton = false,
}: ITableProps<T>) => {
  return (
    <DataTable
      columns={columns}
      data={Array.isArray(data) ? data : []}
      isLoading={isLoading}
      totalItems={totalItems}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      onPageChange={setCurrentPage}
      setItemsPerPage={setItemsPerPage}
      icon={<FileCog />}
      title="Appointments"
      showSearch={showSearch}
      searchValue={search}
      onSearchChange={handleSearchChange}
      tabs={[
        { name: "All Appointments", route: "/admin/all-appointments" },
        { name: "Offline Appointment", route: "/admin/onsite-appointment" },
        {
          name: "Online Appointment",
          route: "/admin/tele-online-appointment",
        },
      ]}
      //   rightComponents={<AllDepartment />}
      IsCreate={showCreateButton}
      setIsModalOpen={setIsModalOpen}
      isShowStatus={false}
    />
  );
};

export default AppointmentsTable;
