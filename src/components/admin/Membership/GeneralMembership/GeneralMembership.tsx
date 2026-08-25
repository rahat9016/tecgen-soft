"use client";

import ViewGeneralMembershipModal from "@/src/components/admin/Membership/Modals/ViewGeneralMembershipModal";
import { DataTable } from "@/src/components/ui/data-table";
import { useGet } from "@/src/hooks/useGet";
import { usePagination } from "@/src/hooks/usePagination";
import { useSearchDebounce } from "@/src/hooks/useSearchDebounce";
import { useAppSelector } from "@/src/lib/redux/hooks";
import { StatusType } from "@/src/types/common/common";
import { FileCog } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GetGeneralMembershipColumns } from "../Columns/GeneralMembershipColumns";
import { membershipTabs } from "../constants";
import { IGeneralMembership } from "../types";

export default function GeneralMembership() {
  const router = useRouter();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] =
    useState<IGeneralMembership | null>(null);

  const {
    setCurrentPage,
    itemsPerPage,
    currentPage,
    totalItems,
    setTotalItems,
    setItemsPerPage,
  } = usePagination();

  const { search, handleSearchChange, debouncedSearch } =
    useSearchDebounce(300);
  const { sortBy } = useAppSelector((state) => state.filter);

  const { data, isLoading } = useGet<IGeneralMembership[]>(
    "/general-membership",
    [
      "general-membership",
      currentPage.toString(),
      itemsPerPage.toString(),
      debouncedSearch,
      sortBy,
    ],
    {
      ...(itemsPerPage !== -1 && {
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      }),
      search: debouncedSearch,
      ...(sortBy && { status: sortBy }),
    }
  );
  const membershipData = data?.data;
  useEffect(() => {
    if (data) {
      setTotalItems(data.meta?.totalItems || 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleView = (item: IGeneralMembership) => {
    setSelectedMembership(item);
    setIsViewModalOpen(true);
  };

  const handleEdit = (item: IGeneralMembership) => {
    router.push(`/admin/general-membership/${item.id}`);
  };

  const columns = GetGeneralMembershipColumns({
    onView: handleView,
    onEdit: handleEdit,
  });

  return (
    <div>
      <DataTable
        columns={columns}
        data={membershipData || []}
        isLoading={isLoading}
        totalItems={totalItems}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
        icon={<FileCog />}
        title="General Membership"
        showSearch
        searchValue={search}
        onSearchChange={handleSearchChange}
        routeURL="/admin/add-general-membership"
        tabs={membershipTabs}
        IsCreate
        statusOptions={[
          { label: "All Status", value: "all" },
          { label: "Active", value: StatusType.ACTIVE },
          { label: "Inactive", value: StatusType.INACTIVE },
          { label: "Pending", value: StatusType.PENDING },
          { label: "Rejected", value: StatusType.REJECTED },
        ]}
        isShowStatus
      />

      <ViewGeneralMembershipModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        data={selectedMembership || undefined}
      />
    </div>
  );
}
