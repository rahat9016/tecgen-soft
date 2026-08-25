"use client";

import { DataTable } from "@/src/components/ui/data-table";
import { ITableProps } from "@/src/types/common/common";
import { FileCog } from "lucide-react";

const CareersTable = <T,>({
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
  createTitle,
  routeURL,
  statusOptions,
  isShowStatus,
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
      title="Career"
      showSearch={showSearch}
      searchValue={search}
      onSearchChange={handleSearchChange}
      createTitle={createTitle}
      routeURL={routeURL}
      tabs={[
        { name: "Applicant List", route: "/admin/applicant-list" },
        { name: "Job List", route: "/admin/job-list" },
      ]}
      IsCreate={showCreateButton}
      setIsModalOpen={setIsModalOpen}
      isShowStatus={isShowStatus}
      statusOptions={statusOptions}
    />
  );
};

export default CareersTable;
