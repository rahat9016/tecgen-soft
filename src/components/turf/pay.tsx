"use client";

import { useState } from "react";
import Image from "next/image";
import { Banknote, Check, CheckCircle2, ClipboardPaste, Copy } from "lucide-react";
import { payLabels } from "@/src/lib/turf-store/format";
import { plainT, type T } from "@/src/lib/turf-store/i18n";
import type { PayMethod } from "@/src/lib/turf-store/types";
import { cn } from "@/src/lib/utils";

/**
 * Payment pieces shared by the booking site's payment step and the admin panel, so customers and the
 * front desk see the same amount choices, wallet tiles and transaction-ID field.
 */

export const BD_PHONE = /^01[3-9]\d{8}$/;
export const TRX_ID = /^[A-Z0-9]{8,10}$/;

/**
 * Takes whatever was pasted — the bare ID or the whole confirmation SMS ("… TrxID BJ74K3XQ2M at …")
 * — and returns the ID in canonical form.
 */
export function parseTrxId(text: string) {
  const fromSms = text.match(/\b(?:trx|txn)\s*id\s*[:#.-]?\s*([a-z0-9]{8,10})\b/i);
  return (fromSms ? fromSms[1] : text.replace(/[^a-z0-9]/gi, "")).toUpperCase().slice(0, 20);
}

/** The venue number as shown, and as wallet apps take it (local 11 digits). */
export const walletNumber = (phone: string) => ({ shown: phone.replace(/^\+880\s?/, "0"), copy: phone.replace(/\D/g, "").replace(/^880/, "0") });

/** Logos on the "Pay with" tiles (files in /public/payments); sized so all of them fit a 320px phone. */
const payLogos: Record<Exclude<PayMethod, "cash">, { src: string; w: number; h: number; cls: string }[]> = {
  bkash: [{ src: "/payments/bkash.webp", w: 208, h: 96, cls: "h-7 sm:h-8" }],
  nagad: [{ src: "/payments/nagad.webp", w: 274, h: 96, cls: "h-7 sm:h-8" }],
  card: [
    { src: "/payments/visa.svg", w: 1000, h: 325, cls: "h-3 sm:h-3.5" },
    { src: "/payments/mastercard.svg", w: 1000, h: 618, cls: "h-4 sm:h-5" },
  ],
};

const picked = "border-emerald-900 ring-1 ring-emerald-900";
const unpicked = "border-neutral-200 hover:border-emerald-700";

/** Radio cards for how much is paid now, e.g. "30% advance ৳1,980" / "Full amount ৳6,600". */
export function AmountChoice<T extends string | boolean>({
  options,
  value,
  onChange,
  className,
}: {
  options: { v: T; t: string; a: string }[];
  value: T;
  onChange: (v: T) => void;
  /** Grid columns; two side by side from tablet width unless overridden. */
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2 sm:grid-cols-2", className)}>
      {options.map((o) => {
        const on = value === o.v;
        return (
          <button
            type="button"
            key={String(o.v)}
            onClick={() => onChange(o.v)}
            aria-pressed={on}
            className={cn("flex h-14 items-center gap-3 rounded-lg border px-4 text-left transition", on ? picked : unpicked)}
          >
            <span className={cn("flex size-4 shrink-0 items-center justify-center rounded-full border", on ? "border-emerald-900" : "border-neutral-300")}>
              {on && <span className="size-2 rounded-full bg-emerald-900" />}
            </span>
            <span className="flex-1 text-sm font-medium text-neutral-800">{o.t}</span>
            <span className="font-semibold tabular-nums text-neutral-900">{o.a}</span>
          </button>
        );
      })}
    </div>
  );
}

/** "Pay with" tiles: wallet and card logos, plus a cash tile where the desk takes cash. */
export function MethodTiles<M extends PayMethod>({ methods, value, onChange, t = plainT }: { methods: M[]; value: M; onChange: (m: M) => void; t?: T }) {
  return (
    <div className="flex gap-2">
      {methods.map((m) => {
        const on = value === m;
        return (
          <button
            type="button"
            key={m}
            onClick={() => onChange(m)}
            aria-pressed={on}
            aria-label={t(payLabels[m])}
            className={cn("relative flex h-14 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg border bg-white px-1.5 transition sm:gap-1.5 sm:px-3", on ? picked : unpicked)}
          >
            {m === "cash" ? (
              <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-900">
                <Banknote className="size-5" /> {t("Cash")}
              </span>
            ) : (
              payLogos[m as Exclude<PayMethod, "cash">].map((l) => (
                <Image key={l.src} src={l.src} alt="" width={l.w} height={l.h} unoptimized={l.src.endsWith(".svg")} className={cn("w-auto min-w-0 max-w-full object-contain", l.cls)} />
              ))
            )}
            {on && (
              <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-emerald-900 text-white">
                <Check className="size-3" strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** A value to type into the wallet app, with a copy button where the browser allows it. */
export function CopyRow({ label, value, copy = value, t = plainT }: { label: string; value: string; copy?: string; t?: T }) {
  const [copied, setCopied] = useState(false);
  // Clipboard is only exposed on secure origins (not on a phone hitting the dev server by LAN IP).
  const canCopy = typeof navigator !== "undefined" && !!navigator.clipboard;
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <dt className="whitespace-nowrap text-neutral-500">{label}</dt>
      <dd className="flex items-center gap-1 whitespace-nowrap font-semibold tabular-nums text-neutral-900">
        {value}
        {canCopy && (
          <button
            type="button"
            aria-label={t("Copy {what}", { what: label.toLowerCase() })}
            onClick={() =>
              navigator.clipboard
                .writeText(copy)
                .then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                })
                .catch(() => {})
            }
            className="flex size-8 items-center justify-center rounded-md text-neutral-500 transition hover:bg-white hover:text-emerald-800"
          >
            {copied ? <Check className="size-4 text-emerald-700" /> : <Copy className="size-4" />}
          </button>
        )}
      </dd>
    </div>
  );
}

/** "Send Money to" and "Amount" for a bKash/Nagad payment, both copyable. */
export function WalletDetails({ venuePhone, amount, amountLabel, t = plainT }: { venuePhone: string; amount: number; amountLabel: string; t?: T }) {
  const n = walletNumber(venuePhone);
  return (
    <dl className="divide-y divide-neutral-200/70 rounded-lg bg-neutral-50 px-4 text-sm">
      <CopyRow label={t("Send Money to")} value={n.shown} copy={n.copy} t={t} />
      <CopyRow label={t("Amount")} value={amountLabel} copy={String(amount)} t={t} />
    </dl>
  );
}

/** Wallet transaction-ID field: accepts the bare ID or the whole SMS, with a Paste button and a tick once valid. */
export function TrxIdField({
  id,
  method,
  value,
  onChange,
  onCommit,
  error,
  inputClassName,
  labelClassName,
  t = plainT,
}: {
  id: string;
  method: PayMethod;
  value: string;
  onChange: (v: string) => void;
  /** Called on blur and after a paste — where the parent starts showing errors. */
  onCommit?: (v: string) => void;
  /** Shown instead of the hint; the parent decides when it's time to show it. */
  error?: string;
  inputClassName: string;
  labelClassName: string;
  t?: T;
}) {
  // Clipboard reads need a secure origin and, on some browsers, a one-time permission.
  const canPaste = typeof navigator !== "undefined" && !!navigator.clipboard?.readText;
  const valid = TRX_ID.test(value);
  const paste = async () => {
    try {
      const v = parseTrxId(await navigator.clipboard.readText());
      onChange(v);
      onCommit?.(v);
    } catch {}
  };
  return (
    <div>
      <label htmlFor={id} className={labelClassName}>
        {t("{method} transaction ID", { method: payLabels[method] })}
      </label>
      <div className="relative">
        <input
          id={id}
          className={cn(inputClassName, "pr-20 font-medium tracking-wider placeholder:font-normal placeholder:tracking-normal")}
          placeholder={t("e.g. {id}", { id: method === "bkash" ? "BJ74K3XQ2M" : "7A3F9K2L" })}
          value={value}
          onChange={(e) => onChange(parseTrxId(e.target.value))}
          onBlur={() => onCommit?.(value)}
          autoComplete="off"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          aria-invalid={!!error}
          aria-describedby={`${id}-hint`}
        />
        <span className="absolute inset-y-0 right-2 flex items-center">
          {valid && !error ? (
            <CheckCircle2 className="mr-1.5 size-5 text-emerald-600" aria-label={t("Looks right")} />
          ) : (
            canPaste && (
              <button type="button" onClick={paste} className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50">
                <ClipboardPaste className="size-3.5" /> {t("Paste")}
              </button>
            )
          )}
        </span>
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-rose-600">{error}</p>
      ) : (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-neutral-500">
          {t("Paste the ID or the whole {method} SMS.", { method: payLabels[method] })}
        </p>
      )}
    </div>
  );
}
