"use client";

import { useCartPersist } from "@/src/hooks/useCartPersist";

export default function CartInit() {
  useCartPersist();
  return null;
}
