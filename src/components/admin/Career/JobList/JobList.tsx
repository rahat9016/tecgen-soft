"use client";
import { useGet } from "@/src/hooks/useGet";
import { usePagination } from "@/src/hooks/usePagination";
import { useSearchDebounce } from "@/src/hooks/useSearchDebounce";
import { useAppSelector } from "@/src/lib/redux/hooks";
import { useEffect, useState } from "react";
import CareersTable from "../CareersTable";
import { GetCareerColumns } from "../TableColumns/CareerColumns";
import { ICareer } from "../types";
import ViewJobDetailsModal from "../ViewJobDetailsModal/ViewJobDetailsModal";

export default function JobList() {
  const [openView, setOpenView] = useState(false);
  const [selectedJob, setSelectedJob] = useState<ICareer | undefined>();
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

  const { data, isLoading } = useGet<ICareer[]>(
    "/career",
    [
      "careers",
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

  const handleView = (doctor: ICareer) => {
    setSelectedJob(doctor);
    setOpenView(true);
  };

  // Update total items whenever data changes
  useEffect(() => {
    if (data) {
      setTotalItems(data.meta?.totalItems || 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const columns = GetCareerColumns(handleView);
  return (
    <div>
      <CareersTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        totalItems={totalItems}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
        search={search}
        handleSearchChange={handleSearchChange}
        showCreateButton
        createTitle="Create new job"
        routeURL="/admin/add-job"
      />
      <ViewJobDetailsModal
        isOpen={openView}
        onClose={() => setOpenView(false)}
        data={selectedJob}
      />
    </div>
  );
}
