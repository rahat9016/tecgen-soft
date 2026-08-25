"use client";

import ViewMembershipPackageModal from "@/src/components/admin/Membership/Modals/ViewMembershipPackageModal";
import { DataTable } from "@/src/components/ui/data-table";
import { useGet } from "@/src/hooks/useGet";
import { usePagination } from "@/src/hooks/usePagination";
import { useSearchDebounce } from "@/src/hooks/useSearchDebounce";
import { useAppSelector } from "@/src/lib/redux/hooks";
import { FileCog } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GetMembershipPackageColumns } from "../Columns/MembershipPackageColumns";
import { membershipTabs } from "../constants";
import { IMembershipPackage } from "../types";

export default function MembershipPackages() {
  const router = useRouter();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] =
    useState<IMembershipPackage | null>(null);

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

  const { data, isLoading } = useGet<IMembershipPackage[]>(
    "/package",
    [
      "membership-package",
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
  const packageData = data?.data;
  useEffect(() => {
    if (data) {
      setTotalItems(data.meta?.totalItems || 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleView = (item: IMembershipPackage) => {
    setSelectedPackage(item);
    setIsViewModalOpen(true);
  };

  const handleEdit = (item: IMembershipPackage) => {
    router.push(`/admin/packages/${item.id}`);
  };

  const columns = GetMembershipPackageColumns({
    onView: handleView,
    onEdit: handleEdit,
  });

  return (
    <div>
      <DataTable
        columns={columns}
        data={packageData || []}
        isLoading={isLoading}
        totalItems={totalItems}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
        icon={<FileCog />}
        title="Membership Packages"
        showSearch
        searchValue={search}
        onSearchChange={handleSearchChange}
        createTitle="Add New Package"
        routeURL="/admin/add-package"
        tabs={membershipTabs}
        IsCreate
      />

      <ViewMembershipPackageModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        data={selectedPackage || undefined}
      />
    </div>
  );
}
