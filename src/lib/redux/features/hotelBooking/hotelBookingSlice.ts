import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { HotelBookingSelection, HotelBookingState } from "./hotelBookingTypes";

const initialState: HotelBookingState = {
  selection: null,
  lastBookingId: null,
};

const hotelBookingSlice = createSlice({
  name: "hotelBooking",
  initialState,
  reducers: {
    setSelection: (state, action: PayloadAction<HotelBookingSelection>) => {
      state.selection = action.payload;
    },
    clearSelection: (state) => {
      state.selection = null;
    },
    setLastBookingId: (state, action: PayloadAction<string>) => {
      state.lastBookingId = action.payload;
    },
  },
});

export const { setSelection, clearSelection, setLastBookingId } = hotelBookingSlice.actions;
export default hotelBookingSlice.reducer;
