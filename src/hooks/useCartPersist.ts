"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/src/lib/redux/hooks";
import { hydrateCart } from "@/src/lib/redux/features/cart/cartSlice";

const CART_STORAGE_KEY = "fitstorebd_cart";

export function useCartPersist() {
  const dispatch = useAppDispatch();
  const { items, hydrated } = useAppSelector((state) => state.cart);
  const isFirstRun = useRef(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      dispatch(hydrateCart(raw ? JSON.parse(raw) : []));
    } catch {
      dispatch(hydrateCart([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);
}
