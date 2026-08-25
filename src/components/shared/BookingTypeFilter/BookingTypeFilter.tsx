import { Funnel } from "lucide-react";

import { setBookingType } from "@/src/lib/redux/features/filter/filterSlice";
import { useAppDispatch } from "@/src/lib/redux/hooks";
import { BookingType } from "@/src/types/common/common";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

interface BookingTypeFilterProps {
  bookingTypeOptions?: { label: string; value: string }[];
}

const defaultBookingTypes = [
  { label: "All Booking Type", value: "all" },
  { label: "Onsite", value: BookingType.ONSITE },
  { label: "Tele Online", value: BookingType.TELE_ONLINE },
];

export default function BookingTypeFilter({
  bookingTypeOptions,
}: BookingTypeFilterProps) {
  const dispatch = useAppDispatch();

  const optionsToRender =
    bookingTypeOptions && bookingTypeOptions.length > 0
      ? bookingTypeOptions
      : defaultBookingTypes;

  return (
    <Select
      defaultValue="all"
      onValueChange={(value) => {
        dispatch(setBookingType(value === "all" ? "" : value));
      }}
    >
      <SelectTrigger className="w-44 h-11 border border-light-dark justify-center cursor-pointer">
        <Funnel className="text-secondary-foreground" />
        <SelectValue
          placeholder="All Booking Type"
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
