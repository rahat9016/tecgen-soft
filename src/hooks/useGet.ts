import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { axiosInstance } from "../helpers/axios/axiosInstance";
import { IGenericErrorResponse } from "../types/common/common";

interface IGenericResponse<T> {
  data: T;
  meta?: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export const useGet = <T>(
  endpoint: string,
  queryKey: string[],
  queryParams?: Record<string, unknown>,
  options?: Omit<
    UseQueryOptions<
      IGenericResponse<T>,
      IGenericErrorResponse,
      IGenericResponse<T>,
      string[]
    >,
    "queryKey" | "queryFn"
  >
) => {
  const filteredParams = Object.fromEntries(
    Object.entries(queryParams || {}).filter(([, value]) => {
      return value !== "" && value !== undefined && value !== null;
    })
  );

  const finalQueryKey = [
    ...queryKey,
    ...Object.values(filteredParams).map(String),
  ];

  return useQuery<
    IGenericResponse<T>,
    IGenericErrorResponse,
    IGenericResponse<T>,
    string[]
  >({
    queryKey: finalQueryKey,
    retry: false,
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(endpoint, {
          params: filteredParams,
        });
        return response;
      } catch (error) {
        throw error;
      }
    },
    enabled: options?.enabled ?? true,
    ...options,
  });
};
