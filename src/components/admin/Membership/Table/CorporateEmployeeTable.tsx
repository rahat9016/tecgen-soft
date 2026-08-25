import { Plus } from "lucide-react";
import { ReactNode } from "react";

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

export interface CorporateEmployeeColumnDef<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (value: T[keyof T], row: T, rowIndex: number) => ReactNode;
}

interface CorporateEmployeeTableProps<T> {
  columns: CorporateEmployeeColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  createTitle?: string;
  onCreate?: () => void;
}

export default function CorporateEmployeeTable<T>({
  columns,
  data,
  isLoading = false,
  createTitle = "Add Employee",
  onCreate,
}: CorporateEmployeeTableProps<T>) {
  return (
    <div className="border border-light-silver rounded-lg mt-2">
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-3 p-5 border-b border-light-silver">
        <div className="text-secondary-foreground text-sm">Employee List</div>
        <Button
          type="button"
          className="text-white font-inter text-sm font-medium bg-primary hover:bg-primary/90 h-11 gap-1 px-6! mb-3 lg:mb-0"
          onClick={onCreate}
        >
          <Plus className="text-2xl! text-white" /> {createTitle}
        </Button>
      </div>

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
              Array.from({ length: 3 }).map((_, rowIndex) => (
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
                <TableCell
                  colSpan={columns.length}
                  className="max-w-50 text-[#BDBDBD] text-center"
                >
                  No employee added
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow className="h-18" key={rowIndex}>
                  {columns.map((column, idx) => {
                    const value = row[column.accessorKey];
                    return (
                      <TableCell
                        key={`${rowIndex}-${idx}-${String(column.accessorKey)}`}
                        className="max-w-50 truncate whitespace-nowrap px-5 text-sm text-secondary-gary border-b border-light-dark"
                      >
                        {column.cell
                          ? column.cell(value, row, rowIndex)
                          : (value as ReactNode)}
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
  );
}
