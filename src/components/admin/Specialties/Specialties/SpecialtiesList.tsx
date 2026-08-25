"use client";
import { DataTable } from "@/src/components/ui/data-table";
import { useGet } from "@/src/hooks/useGet";
import { usePagination } from "@/src/hooks/usePagination";
import { useSearchDebounce } from "@/src/hooks/useSearchDebounce";
import { useEffect } from "react";
import { ISpecialty } from "../types";
import { GetSpecialtiesColumns } from "./SpecialtiesColumns/SpecialtiesColumns";

export default function SpecialtiesList() {
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

  const { data, isLoading } = useGet<ISpecialty[]>(
    "/specialities",
    [
      "specialities",
      currentPage.toString(),
      itemsPerPage.toString(),
      debouncedSearch,
    ],
    {
      ...(itemsPerPage !== -1 && {
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      }),
      search: debouncedSearch,
    }
  );

  // Update total items whenever data changes
  useEffect(() => {
    if (data) {
      setTotalItems(data.meta?.totalItems || 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
  const columns = GetSpecialtiesColumns();

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
        title="Specialties"
        createTitle="Add New Specialty"
        routeURL="/admin/add-speciality?fresh=1"
        searchValue={search}
        onSearchChange={handleSearchChange}
        tabs={[
          { name: "Specialties", route: "/admin/specialties" },
          { name: "Darft", route: "/admin/specialties-darft" },
        ]}
        isShowStatus={false}
        IsCreate
      />
    </div>
  );
}
