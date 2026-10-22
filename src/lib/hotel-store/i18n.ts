"use client";

import { useCallback, useSyncExternalStore } from "react";
import { bn } from "./i18n-bn";

/**
 * Admin dashboard language. English is the default; staff can switch to Bangla from the header.
 * Strings are looked up by their English text, so anything not yet translated simply shows in English.
 */
export type Lang = "en" | "bn";

const KEY = "hotel-admin-lang";
const EVENT = "hotel-admin-lang";

const read = (): Lang => {
  try {
    return localStorage.getItem(KEY) === "bn" ? "bn" : "en";
  } catch {
    return "en";
  }
};

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
};

export function setLang(lang: Lang) {
  try {
    localStorage.setItem(KEY, lang);
  } catch {}
  document.documentElement.lang = lang;
  window.dispatchEvent(new Event(EVENT));
}

export const useLang = () => useSyncExternalStore(subscribe, read, () => "en" as Lang);

/** `{name}` placeholders are filled from `vars`, in either language. */
export function translate(lang: Lang, text: string, vars?: Record<string, string | number>) {
  const out = lang === "bn" ? (bn[text] ?? text) : text;
  return vars ? out.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : out;
}

/** `t("Bookings")` → "বুকিং" in Bangla, "Bookings" in English. */
export function useT() {
  const lang = useLang();
  return useCallback((text: string, vars?: Record<string, string | number>) => translate(lang, text, vars), [lang]);
}
