"use client";

import { useMemo, useSyncExternalStore } from "react";
import { STORAGE_KEY, type BookingRecord } from "./hotelBookingHistory";

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};

const readRaw = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
};

/** Bookings saved in this browser; empty during server render so hydration stays stable. */
export function useBookingHistory(): BookingRecord[] {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  return useMemo(() => {
    try {
      return JSON.parse(raw) as BookingRecord[];
    } catch {
      return [];
    }
  }, [raw]);
}
