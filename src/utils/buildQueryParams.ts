export interface QueryFilters {
  sort?: string[];
  search?: string;
  selectDepartment?: string | number;
  bookingType?: string;
  doctorId?: string | number;
}

export interface Pagination {
  page?: number;
  limit?: number;
}

export const buildQueryParams = (
  filters: QueryFilters,
  pagination?: Pagination
): string => {
  const params = new URLSearchParams();
  filters.sort?.forEach((field) => {
    params.append("sort", field);
  });

  // search
  if (filters.search) {
    params.append("search", filters.search);
  }
  // filters
  if (filters.selectDepartment) {
    params.append("departmentId", filters.selectDepartment.toString());
  }
  if (filters.bookingType) {
    params.append("bookingType", filters.bookingType);
  }
  if (filters.doctorId) {
    params.append("doctorId", filters.doctorId.toString());
  }

  // pagination
  if (pagination?.page !== undefined) {
    params.append("page", pagination.page.toString());
  }
  if (pagination?.limit !== undefined) {
    params.append("limit", pagination.limit.toString());
  }

  return params.toString();
};
