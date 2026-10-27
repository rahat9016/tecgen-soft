"use client";

import { useCallback, useSyncExternalStore } from "react";
import { bn } from "./i18n-bn";

/**
 * Turf admin language — same approach as the hotel admin: English by default, Bangla from the header
 * switch. Strings are looked up by their English text, so anything not yet translated shows in English.
 * The choice is remembered per browser, separately from the hotel admin's.
 */
export type Lang = "en" | "bn";

const KEY = "turf-admin-lang";
const EVENT = "turf-admin-lang";

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

export type T = (text: string, vars?: Record<string, string | number>) => string;

/** `{name}` placeholders are filled from `vars`, in either language. */
export function translate(lang: Lang, text: string, vars?: Record<string, string | number>) {
  const out = lang === "bn" ? (bn[text] ?? text) : text;
  return vars ? out.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : out;
}

/** `t("Bookings")` → "বুকিং" in Bangla, "Bookings" in English. */
export function useT(): T {
  const lang = useLang();
  return useCallback((text: string, vars?: Record<string, string | number>) => translate(lang, text, vars), [lang]);
}

/** English with placeholders filled — for shared pieces (the booking site) that don't translate. */
export const plainT: T = (text, vars) => translate("en", text, vars);
