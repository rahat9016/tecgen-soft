import { Plus, Search } from "lucide-react";
import { ReactNode } from "react";

import { clearFilters } from "@/src/lib/redux/features/filter/filterSlice";
import { useAppDispatch } from "@/src/lib/redux/hooks";
import { usePathname, useRouter } from "next/navigation";
import Pagination from "../shared/Pagination";
import Paragraph from "../shared/Paragraph";
import StatusFilter from "../shared/StatusFilter/StatusFilter";
import TableTopBarHeader from "../shared/TableTopBarHeader";
import { Button } from "./button";
import { Input } from "./input";
import { Skeleton } from "./skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

// Types
export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T;
  sortable?: boolean;
  cell?: (value: T[keyof T], row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  tabs?: {
    name: string;
    route?: string;
  }[];
  isLoading: boolean;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  setItemsPerPage: ((page: string | number) => void) | undefined;
  createTitle?: string;
  title?: string;
  icon?: ReactNode;
  subtitle?: string;
  searchValue?: string;
  tableTitle?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showSearch?: boolean;
  isShowStatus?: boolean;
  searchPlaceholder?: string;
  setIsModalOpen?: (isOpen: boolean) => void;
  IsCreate?: boolean;
  routeURL?: string;
  setSelectedId?: (id: string) => void;
  options?: { value: string; label: string }[];
  rightComponents?: ReactNode;
  statusOptions?: { label: string; value: string }[];
  showTopBar?: boolean;
  showPagination?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  tabs = [],
  isLoading,
  totalItems,
  currentPage,
  itemsPerPage,
  onPageChange,
  setItemsPerPage,
  title,
  setIsModalOpen,
  IsCreate = false,
  createTitle = "Create",
  routeURL,
  showSearch = true,
  searchValue,
  tableTitle,
  onSearchChange,
  searchPlaceholder = "Searching...",
  rightComponents,
  statusOptions,
  isShowStatus = true,
  showTopBar = true,
  showPagination = true,
}: DataTableProps<T>) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pathname = usePathname();

  return (
    <>
      {showTopBar && (
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-6">
          <TableTopBarHeader title={title} />

          {IsCreate && (
            <Button
              className="text-white font-inter text-sm font-medium bg-primary hover:bg-primary/70 h-11 gap-1 px-6! mb-3 lg:mb-0"
              onClick={() => {
                if (routeURL) {
                  router.push(routeURL);
                } else if (setIsModalOpen) {
                  setIsModalOpen(true);
                }
              }}
            >
              <Plus className="text-2xl! text-white" /> {createTitle}
            </Button>
          )}
        </div>
      )}

      <div>
        <div className="w-full overflow-x-auto  rounded-xl overflow-hidden">
          <div
            id="table-tab"
            className="bg-white p-5 rounded-t-lg border border-light-dark"
          >
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              {tableTitle && (
                <Paragraph className="text-sm xl:text-xl  text-secondary-dark font-semibold">
                  {tableTitle}
                </Paragraph>
              )}
              <div className="flex  items-center gap-3">
                {tabs.length > 0 ? (
                  <div className="overflow-hidden rounded-sm border border-light-dark h-11">
                    {tabs.map((tab) => (
                      <Button
                        key={tab.name}
                        className={`h-full text-secondary-dark rounded-none cursor-pointer text-sm font-medium  ${
                          pathname === tab.route
                            ? "bg-primary text-white"
                            : "bg-transparent hover:bg-transparent"
                        }`}
                        onClick={() => {
                          router.push(tab.route as string);
                          dispatch(clearFilters());
                        }}
                      >
                        {tab.name}
                      </Button>
                    ))}
                  </div>
                ) : (
                  showSearch && (
                    <div className="flex items-center border border-light-dark px-3 rounded-[6px] h-11 w-full max-w-60">
                      <Search className="text-[#BDBDBD]" />
                      <Input
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={onSearchChange}
                        className="border-none shadow-none focus-visible:ring-0 placeholder:text-[#BDBDBD] bg-transparent"
                      />
                    </div>
                  )
                )}
              </div>

              <div className="flex items-center gap-3">
                {tabs.length > 0 && showSearch && (
                  <div className="flex items-center border border-light-dark px-3 rounded-[6px] h-11 w-full max-w-60">
                    <Search className="text-[#BDBDBD]" />
                    <Input
                      placeholder={searchPlaceholder}
                      value={searchValue}
                      onChange={onSearchChange}
                      className="border-none shadow-none focus-visible:ring-0 placeholder:text-[#BDBDBD] bg-transparent"
                    />
                  </div>
                )}
                {rightComponents}
                {isShowStatus && <StatusFilter statusOptions={statusOptions} />}
              </div>
            </div>
          </div>
          <Table className="min-w-full border-collapse">
            <TableHeader>
              <TableRow className="bg-light h-15 border border-light-dark border-t-0">
                {columns.map((column, index) => (
                  <TableHead
                    key={index}
                    className="font-medium text-sm text-secondary-dark px-5"
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody className="border border-light-dark bg-white">
              {isLoading ? (
                Array.from({ length: itemsPerPage }).map((_, rowIndex) => (
                  <TableRow className="h-18" key={`skeleton-${rowIndex}`}>
                    {columns.map((_, colIndex) => (
                      <TableCell key={colIndex} className="max-w-50">
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="w-full h-[50vh] text-center"
                  >
                    No data found
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, rowIndex) => (
                  <TableRow className="h-18" key={rowIndex}>
                    {columns.map((column, idx) => {
                      const value = row[column.accessorKey];
                      return (
                        <TableCell
                          key={`${rowIndex}-${idx}-${String(
                            column.accessorKey
                          )}`}
                          className="max-w-50 truncate whitespace-nowrap px-5 text-sm text-secondary-gary border-b border-light-dark"
                        >
                          {column?.cell
                            ? column.cell(value, row)
                            : (value as React.ReactNode)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {showPagination && (
          <div className="bg-white border border-t-0 border-light-dark  rounded-b-lg">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              setItemsPerPage={setItemsPerPage}
            />
          </div>
        )}
      </div>
    </>
  );
}
