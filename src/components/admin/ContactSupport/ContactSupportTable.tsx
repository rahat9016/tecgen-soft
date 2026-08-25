"use client";

import { DataTable } from "@/src/components/ui/data-table";
import { ITableProps, StatusType } from "@/src/types/common/common";
import { FileCog } from "lucide-react";

const ContactSupportTable = <T,>({
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
      title="Contact & Support"
      showSearch={showSearch}
      searchValue={search}
      onSearchChange={handleSearchChange}
      createTitle={createTitle}
      routeURL={routeURL}
      tabs={[
        {
          name: "Contact & Support List",
          route: "/admin/contact-support-list",
        },
        { name: "Contact info", route: "/admin/contact-info" },
      ]}
      IsCreate={showCreateButton}
      setIsModalOpen={setIsModalOpen}
      isShowStatus={isShowStatus}
      statusOptions={[
        { label: "All Status", value: "all" },
        { label: "Pending", value: StatusType.PENDING },
        { label: "Resolved", value: StatusType.RESOLVED },
        { label: "Inactive", value: StatusType.INACTIVE },
      ]}
    />
  );
};

export default ContactSupportTable;
