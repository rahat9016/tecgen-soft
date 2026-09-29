"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { toast } from "react-toastify";
import type { Gadget } from "@/src/data/gadgets";

type GadgetCartValue = {
  count: number;
  add: (item: Gadget) => void;
};

const GadgetCartContext = createContext<GadgetCartValue | null>(null);

// Kept separate from the FitStore redux cart so the two demos don't share items.
export function GadgetCartProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);

  const add = useCallback((item: Gadget) => {
    setCount((c) => c + 1);
    toast.success(`${item.name} added to cart`);
  }, []);

  const value = useMemo(() => ({ count, add }), [count, add]);

  return <GadgetCartContext.Provider value={value}>{children}</GadgetCartContext.Provider>;
}

export function useGadgetCart() {
  const ctx = useContext(GadgetCartContext);
  if (!ctx) throw new Error("useGadgetCart must be used inside GadgetCartProvider");
  return ctx;
}
