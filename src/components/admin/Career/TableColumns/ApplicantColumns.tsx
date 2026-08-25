import { Button } from "@/src/components/ui/button";
import { ColumnDef } from "@/src/components/ui/data-table";
import { Download } from "lucide-react";
import Image from "next/image";
import { IApplicant } from "../types";

export const GetApplicantColumns = (
  onDownload?: (applicant: IApplicant) => void | Promise<void>
): ColumnDef<IApplicant>[] => {
  return [
    {
      header: "Applicant Name",
      accessorKey: "fullName",
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Phone",
      accessorKey: "phone",
    },
    {
      header: "Job Title",
      accessorKey: "career",
      cell: (_value, row) => {
        const applicant = row as IApplicant;
        return <span>{applicant.career?.title || "N/A"}</span>;
      },
    },
    {
      header: "Resume",
      accessorKey: "resume",
      cell: (_value, row) => {
        const applicant = row as IApplicant;

        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border border-[#E6E6E6] flex items-center justify-center rounded-lg bg-light">
              <Image src="/icons/PDF.svg" alt="pdf" width={20} height={20} />
            </div>
            <span className="text-sm font-normal">{applicant.fullName}</span>
          </div>
        );
      },
    },

    {
      header: "Action",
      accessorKey: "action",
      cell: (_value, row) => {
        const applicant = row as IApplicant;

        return (
          <Button
            className="w-11! min-h-9 border border-[#E6E6E6] flex items-center justify-center rounded-lg bg-light hover:bg-light"
            size="sm"
            onClick={() => {
              void onDownload?.(applicant);
            }}
          >
            <Download className="h-5 text-secondary-foreground" />
          </Button>
        );
      },
    },
  ];
};
