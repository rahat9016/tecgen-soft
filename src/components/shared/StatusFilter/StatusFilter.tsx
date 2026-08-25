import { Funnel } from "lucide-react";

import { setSortBy } from "@/src/lib/redux/features/filter/filterSlice";
import { useAppDispatch } from "@/src/lib/redux/hooks";
import { StatusType } from "@/src/types/common/common";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

interface StatusFilterProps {
  statusOptions?: { label: string; value: string }[];
}

const defaultStatuses = [
  { label: "All Status", value: "all" },
  { label: "Active", value: StatusType.ACTIVE },
  { label: "Inactive", value: StatusType.INACTIVE },
];

export default function StatusFilter({ statusOptions }: StatusFilterProps) {
  const dispatch = useAppDispatch();

  const optionsToRender =
    statusOptions && statusOptions.length > 0 ? statusOptions : defaultStatuses;

  return (
    <Select
      defaultValue="all"
      onValueChange={(value) => {
        dispatch(setSortBy(value === "all" ? "" : value));
      }}
    >
      <SelectTrigger className="w-44 h-11 border border-light-dark justify-center cursor-pointer">
        <Funnel className="text-secondary-foreground" />
        <SelectValue
          placeholder="All Status"
          className="text-secondary-foreground text-sm font-medium"
        />
      </SelectTrigger>

      <SelectContent className="text-secondary-foreground">
        {optionsToRender.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
