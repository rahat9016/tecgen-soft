"use client";

import { useGet } from "@/src/hooks/useGet";
import { usePagination } from "@/src/hooks/usePagination";
import { useSearchDebounce } from "@/src/hooks/useSearchDebounce";
import { useAppSelector } from "@/src/lib/redux/hooks";
import { FileCog } from "lucide-react";
import { useEffect, useState } from "react";
import { IHealthCheckPackage } from "../../health-check/types";
import { DataTable } from "../../ui/data-table";
import { GetHealthPackageColumns } from "./TableColumns/HealthPackageColumns";
import ViewHealthPackageModal from "./ViewHealthPackageModal/ViewHealthPackageModal";

export default function HealthPackages() {
  const [openView, setOpenView] = useState(false);
  const [selectedHealthPk, setSelectedHealthPk] = useState<
    IHealthCheckPackage | undefined
  >();
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

  const handleView = (doctor: IHealthCheckPackage) => {
    setSelectedHealthPk(doctor);
    setOpenView(true);
  };

  const { data, isLoading } = useGet<IHealthCheckPackage[]>(
    "/health-packages",
    [
      "health-packages",
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

  // Update total items whenever data changes
  useEffect(() => {
    if (data) {
      setTotalItems(data.meta?.totalItems || 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const columns = GetHealthPackageColumns(handleView);
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
        title="Health Packages"
        createTitle="Add New Package"
        routeURL="/admin/add-health-package"
        showSearch
        searchValue={search}
        onSearchChange={handleSearchChange}
        IsCreate
      />
      <ViewHealthPackageModal
        isOpen={openView}
        onClose={() => setOpenView(false)}
        doctor={selectedHealthPk}
      />
    </div>
  );
}
