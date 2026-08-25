import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartItem, CartState } from "./cartTypes";

const initialState: CartState = {
  items: [],
  lastOrderId: null,
  hydrated: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrateCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.hydrated = true;
    },
    addItem: (
      state,
      action: PayloadAction<{ item: Omit<CartItem, "qty">; qty?: number }>
    ) => {
      const { item, qty = 1 } = action.payload;
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        existing.qty += qty;
      } else {
        state.items.push({ ...item, qty });
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    updateQty: (
      state,
      action: PayloadAction<{ id: string; qty: number }>
    ) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        item.qty = Math.max(1, action.payload.qty);
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    setLastOrderId: (state, action: PayloadAction<string>) => {
      state.lastOrderId = action.payload;
    },
  },
});

export const {
  hydrateCart,
  addItem,
  removeItem,
  updateQty,
  clearCart,
  setLastOrderId,
} = cartSlice.actions;
export default cartSlice.reducer;
