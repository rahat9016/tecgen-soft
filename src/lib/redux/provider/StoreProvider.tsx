"use client";

import { ReactNode, useMemo } from "react";
import { Provider } from "react-redux";
import { makeStore } from "../store";

export default function StoreProvider({ children }: { children: ReactNode }) {
  // Create the store once using useMemo
  const store = useMemo(() => makeStore(), []);

  // Render the Provider with the store
  return <Provider store={store}>{children}</Provider>;
}
