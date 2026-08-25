"use client";

import ViewCorporateMembershipModal from "@/src/components/admin/Membership/Modals/ViewCorporateMembershipModal";
import { DataTable } from "@/src/components/ui/data-table";
import { useGet } from "@/src/hooks/useGet";
import { usePagination } from "@/src/hooks/usePagination";
import { useSearchDebounce } from "@/src/hooks/useSearchDebounce";
import { useAppSelector } from "@/src/lib/redux/hooks";
import { StatusType } from "@/src/types/common/common";
import { FileCog } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GetCorporateMembershipColumns } from "../Columns/CorporateMembershipColumns";
import { membershipTabs } from "../constants";
import { ICorporateMembership } from "../types";

export default function CorporateMembership() {
  const router = useRouter();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] =
    useState<ICorporateMembership | null>(null);

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

  const { data, isLoading } = useGet<ICorporateMembership[]>(
    "/corporate-membership",
    [
      "corporate-membership",
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

  useEffect(() => {
    if (data) {
      setTotalItems(data.meta?.totalItems || 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
  const handleView = (item: ICorporateMembership) => {
    setSelectedMembership(item);
    setIsViewModalOpen(true);
  };

  const handleEdit = (item: ICorporateMembership) => {
    router.push(`/admin/corporate-membership/${item.id}`);
  };

  const columns = GetCorporateMembershipColumns({
    onView: handleView,
    onEdit: handleEdit,
  });

  return (
    <div>
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        totalItems={totalItems}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
        icon={<FileCog />}
        title="Corporate Membership"
        showSearch
        searchValue={search}
        onSearchChange={handleSearchChange}
        routeURL="/admin/add-corporate-membership"
        tabs={membershipTabs}
        IsCreate
        statusOptions={[
          { label: "All Status", value: "all" },
          { label: "Active", value: StatusType.ACTIVE },
          { label: "Inactive", value: StatusType.INACTIVE },
          { label: "Pending", value: StatusType.PENDING },
          { label: "Rejected", value: StatusType.REJECTED },
        ]}
      />

      <ViewCorporateMembershipModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        data={selectedMembership || undefined}
      />
    </div>
  );
}
