import { ColumnDef } from "@/src/components/ui/data-table";

export interface User {
  id: string;
  name: string;
  email: string;
  image: string;
}

export interface Session {
  user: User;
}

export interface IMeta {
  limit: number;
  page: number;
  total: number;
}

export type IGenericErrorResponse = {
  statusCode: number;
  message: string;
  errorMessages: IGenericErrorMessage[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: any[];
};

export type IGenericErrorMessage = {
  path: string | number;
  message: string;
};

export type ResponseSuccessType = {
  data: unknown;
  meta?: IMeta;
};
export type ErrorType = IGenericErrorResponse | null | undefined;

export enum StatusType {
  COMPLETED = "COMPLETED",
  PENDING = "PENDING",
  CANCELLED = "CANCELLED",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  ON_LEAVE = "ON_LEAVE",
  REJECTED = "REJECTED",
}
export enum BookingType {
  ONSITE = "ONSITE",
  TELE_ONLINE = "TELE_ONLINE",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}
export interface ITableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  itemsPerPage?: number;
  showSearch?: boolean;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: ((page: string | number) => void) | undefined;
  search?: string;
  handleSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setIsModalOpen?: (open: boolean) => void;
  showCreateButton?: boolean;
  createTitle?: string;
  routeURL?: string;
  isShowStatus?: boolean;
  statusOptions?: { label: string; value: string }[];
}
export interface ISelectOption {
  label: string;
  value: string | number;
}
