import { cn } from "@/src/lib/utils";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";

interface ISubmitButtonProps {
  isLoading?: boolean;
  label: string;
  className?: string;
}

export default function SubmitButton({
  isLoading = false,
  label = "Submit",
  className = "",
}: ISubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={isLoading}
      className={cn(
        `
        flex items-center h-11 gap-2 text-white  cursor-pointer
        ${
          isLoading
            ? "bg-primary/70 cursor-not-allowed"
            : "bg-primary hover:bg-primary"
        }
        
      `,
        className
      )}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      <Image
        src="/icons/reports-white.svg"
        alt="add new"
        width={36}
        height={36}
        className="w-4"
      />
      {label}
    </Button>
  );
}
