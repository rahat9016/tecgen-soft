import { Plus } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T;
  sortable?: boolean;
  cell?: (value: T[keyof T], row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading: boolean;
  itemsPerPage: number;
  createTitle?: string;
  setIsModalOpen?: (isOpen: boolean) => void;
  IsCreate?: boolean;
}

export function SpecialtyDataTable<T>({
  columns,
  data,
  isLoading,
  itemsPerPage,
  setIsModalOpen,
  IsCreate = true,
  createTitle = "Create",
}: DataTableProps<T>) {
  return (
    <div className="border border-light-silver rounded-lg mt-2">
      <div className="flex flex-col lg:flex-row justify-end lg:items-center gap-3 p-5 border-b border-light-silver">
        {IsCreate && (
          <Button
            type="button"
            className="text-white font-inter text-sm font-medium bg-primary-light hover:bg-primary-light/90 h-11 gap-1 px-6! mb-3 lg:mb-0"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (setIsModalOpen) {
                setIsModalOpen(true);
              }
            }}
          >
            <Plus className="text-2xl! text-white" /> {createTitle}
          </Button>
        )}
      </div>

      <div>
        <div className="w-full overflow-x-auto">
          <Table className="min-w-full border-collapse">
            <TableHeader>
              <TableRow className="bg-light h-15">
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

            <TableBody className="bg-white">
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
                <TableRow className="h-18">
                  {columns.map((_, colIndex) => (
                    <TableCell
                      key={colIndex}
                      className="max-w-50 text-[#BDBDBD]"
                    >
                      --
                    </TableCell>
                  ))}
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
      </div>
    </div>
  );
}
