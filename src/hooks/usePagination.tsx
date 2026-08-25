import { useState } from "react";

interface IPaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export const usePagination = () => {
  const [pagination, setPagination] = useState<IPaginationState>({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
  });

  const setCurrentPage = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const setTotalItems = (total: number) => {
    setPagination((prev) => ({ ...prev, totalItems: total }));
  };

  const setItemsPerPage = (value: string | number) => {
    if (value === "all") {
      setPagination((prev) => ({
        ...prev,
        itemsPerPage: -1,
        currentPage: 1,
      }));
    } else {
      const num = typeof value === "string" ? parseInt(value, 10) : value;
      setPagination((prev) => ({
        ...prev,
        itemsPerPage: num,
        currentPage: 1,
      }));
    }
  };
  return {
    ...pagination,
    setCurrentPage,
    setTotalItems,
    setItemsPerPage,
  };
};
