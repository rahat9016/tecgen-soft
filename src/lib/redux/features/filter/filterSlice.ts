import { BookingType } from "@/src/types/common/common";
import { createSlice } from "@reduxjs/toolkit";
import { IInitialState } from "./filterTypes";

// empty bookingType means "all"; the public appointment page falls back to this
export const DEFAULT_BOOKING_TYPE = BookingType.ONSITE;

const initialState: IInitialState = {
  sortBy: "",
  selectDepartment: "",
  bookingType: "",
  doctorId: "",
};

const filteringSlice = createSlice({
  name: "filtering",
  initialState,
  reducers: {
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    clearFilters: (state) => {
      state.sortBy = "";
      state.selectDepartment = "";
      state.bookingType = "";
      state.doctorId = "";
    },
    setSelectDepartments: (state, action) => {
      state.selectDepartment = action.payload;
    },
    setBookingType: (state, action) => {
      state.bookingType = action.payload;
    },
    setDoctorId: (state, action) => {
      state.doctorId = action.payload;
    },
  },
});

export const {
  setSortBy,
  clearFilters,
  setSelectDepartments,
  setBookingType,
  setDoctorId,
} = filteringSlice.actions;
export default filteringSlice.reducer;
