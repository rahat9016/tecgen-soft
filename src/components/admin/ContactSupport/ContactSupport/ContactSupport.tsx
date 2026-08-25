"use client";
import { useGet } from "@/src/hooks/useGet";
import { usePagination } from "@/src/hooks/usePagination";
import { usePatch } from "@/src/hooks/usePatch";
import { useSearchDebounce } from "@/src/hooks/useSearchDebounce";
import { useAppSelector } from "@/src/lib/redux/hooks";
import { StatusType } from "@/src/types/common/common";
import { useEffect } from "react";
import { toast } from "react-toastify";
import CareersTable from "../ContactSupportTable";
import { GetSupportColumns } from "../TableColumns/SupportColumns";
import { ISupportTicket } from "../types";

export default function ContactSupport() {
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

  const { mutate } = usePatch(() => {
    toast.success("Support status updated successfully!");
  }, [["contact-support"]]);

  const { data, isLoading } = useGet<ISupportTicket[]>(
    "/contact-support",
    [
      "contact-support",
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

  const handleStatusChange = (id: string, newStatus: StatusType) => {
    mutate({
      url: `/contact-support/${id}`,
      data: { status: newStatus },
    });
  };

  const columns = GetSupportColumns(handleStatusChange);
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
      />
    </div>
  );
}
