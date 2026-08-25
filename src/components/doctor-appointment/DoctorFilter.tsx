import {
  DEFAULT_BOOKING_TYPE,
  clearFilters,
  setBookingType,
  setDoctorId,
  setSelectDepartments,
} from "@/src/lib/redux/features/filter/filterSlice";
import { useAppDispatch, useAppSelector } from "@/src/lib/redux/hooks";
import { BookingType, ISelectOption } from "@/src/types/common/common";
import { X } from "lucide-react";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// Radix has no built-in "deselect"; this sentinel item maps back to an empty
// filter value so a chosen option can be cleared from inside the dropdown.
const NONE_VALUE = "__none";

export const DoctorFilter = ({
  departmentOptions,
  doctors,
}: {
  departmentOptions: ISelectOption[];
  doctors: ISelectOption[];
}) => {
  const { bookingType, selectDepartment, doctorId } = useAppSelector(
    (state) => state.filter
  );
  const dispatch = useAppDispatch();

  const departmentValue = selectDepartment ? String(selectDepartment) : "";
  const doctorValue = doctorId ? String(doctorId) : "";
  const hasFilters = Boolean(departmentValue || doctorValue || bookingType);

  return (
    <div className=" flex flex-col lg:flex-row flex-wrap lg:justify-end lg:items-end gap-4">
      <div className="flex flex-col flex-1">
        <div className="flex items-center justify-between">
          <Label className="text-base text-secondary-dark font-normal ">
            Select Departments
          </Label>
          {hasFilters && (
            <button
              type="button"
              onClick={() => dispatch(clearFilters())}
              className="text-sm text-secondary-dark underline cursor-pointer lg:hidden"
            >
              Reset filters
            </button>
          )}
        </div>
        <div className="relative">
          <Select
            value={departmentValue}
            onValueChange={(value) =>
              dispatch(setSelectDepartments(value === NONE_VALUE ? "" : value))
            }
          >
            <SelectTrigger className="w-full mt-1 rounded-[6px] border border-light-silver h-11 ">
              <SelectValue placeholder="Select Departments..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_VALUE}>All Departments</SelectItem>
              {departmentOptions.map((opt) => (
                <SelectItem key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {departmentValue && (
            <button
              type="button"
              aria-label="Clear selected department"
              onClick={() => dispatch(setSelectDepartments(""))}
              className="absolute right-8 top-1/2 -translate-y-1/2 mt-0.5 p-1 rounded-full text-secondary-dark hover:bg-light-silver/40 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div>
        <RadioGroup
          className="flex flex-row j gap-4"
          value={bookingType || DEFAULT_BOOKING_TYPE}
          onValueChange={(value) =>
            dispatch(setBookingType(value as BookingType))
          }
        >
          <div className="flex items-center gap-1">
            <Label
              htmlFor="onsite"
              className="
        cursor-pointer
        border rounded-[6px]
        px-3 h-11 flex items-center
        border-light-silver w-32 lg:w-50
      "
            >
              <RadioGroupItem value={BookingType.ONSITE} id="onsite" />
              Onsite
            </Label>
          </div>
          <div className="flex items-center gap-1">
            <Label
              htmlFor="tele"
              className="
        cursor-pointer
        border rounded-[6px]
        px-3 h-11 flex items-center
        border-light-silver w-32 lg:w-50
      "
            >
              <RadioGroupItem value={BookingType.TELE_ONLINE} id="tele" />
              Tele Online
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex flex-col flex-1">
        <div className="flex items-center justify-between">
          <Label className="text-base text-secondary-dark font-normal">
            Select Doctors
          </Label>
          {hasFilters && (
            <button
              type="button"
              onClick={() => dispatch(clearFilters())}
              className="text-sm text-secondary-dark underline cursor-pointer hidden lg:inline"
            >
              Reset filters
            </button>
          )}
        </div>
        <div className="relative">
          <Select
            value={doctorValue}
            onValueChange={(value) =>
              dispatch(setDoctorId(value === NONE_VALUE ? "" : value))
            }
          >
            <SelectTrigger className="w-full mt-1 rounded-[6px] border border-light-silver h-11">
              <SelectValue placeholder="Select Doctors..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_VALUE}>All Doctors</SelectItem>
              {doctors.map((d) => (
                <SelectItem key={String(d.value)} value={String(d.value)}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {doctorValue && (
            <button
              type="button"
              aria-label="Clear selected doctor"
              onClick={() => dispatch(setDoctorId(""))}
              className="absolute right-8 top-1/2 -translate-y-1/2 mt-0.5 p-1 rounded-full text-secondary-dark hover:bg-light-silver/40 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
