"use client";

import { useGet } from "@/src/hooks/useGet";
import { usePagination } from "@/src/hooks/usePagination";
import { useAppSelector } from "@/src/lib/redux/hooks";
import { FileCog } from "lucide-react";
import { useEffect } from "react";
import { DataTable } from "../../ui/data-table";
import { GetCorporateColumns } from "./TableColumns/CorporateColumns";
import { ICorporate } from "./types";

export default function CorporateManagement() {
  const {
    setCurrentPage,
    itemsPerPage,
    currentPage,
    totalItems,
    setTotalItems,
    setItemsPerPage,
  } = usePagination();
  const { sortBy } = useAppSelector((state) => state.filter);

  const { data, isLoading } = useGet<ICorporate[]>(
    "/corporate-service",
    [
      "corporate-service",
      currentPage.toString(),
      itemsPerPage.toString(),
      sortBy,
    ],
    {
      ...(itemsPerPage !== -1 && {
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      }),
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

  const columns = GetCorporateColumns();
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
        title="Corporate Services"
        createTitle="Add New"
        routeURL="/admin/corporate/add-corporate-services"
        IsCreate
        showSearch={false}
        tableTitle="Company List"
      />
    </div>
  );
}
