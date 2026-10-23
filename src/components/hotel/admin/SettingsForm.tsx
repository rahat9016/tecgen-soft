"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import {
  Bell,
  ChevronDown,
  Clock,
  CreditCard,
  Percent,
  SlidersHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { taka } from "@/src/lib/hotel-store/format";
import { useT } from "@/src/lib/hotel-store/i18n";
import {
  quoteStay,
  saveSettings,
  useHotelDB,
} from "@/src/lib/hotel-store/store";
import type { OnlineMethod, Settings } from "@/src/lib/hotel-store/types";
import { paymentMethodInfo } from "@/src/lib/hotelPayment";
import { cn } from "@/src/lib/utils";
import { Field, hbtn, inputClass, Switch, Tabs } from "./ui";

const times = [
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
];
const online: OnlineMethod[] = ["bkash", "nagad", "rocket", "card"];

type Tab = "pricing" | "payments" | "policies" | "alerts";
type NumKey =
  | "serviceFeeRate"
  | "vatRate"
  | "depositRate"
  | "freeCancellationHours"
  | "lateCancellationFeeRate"
  | "refundFeeRate";

/** Titled group of fields, same look as the Website content page. */
function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const t = useT();
  return (
    <fieldset className="rounded-lg border border-neutral-200 p-3 sm:p-4">
      <legend className="-ml-1 px-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {t(title)}
      </legend>
      {children}
    </fieldset>
  );
}

/** Number input with its unit (%, hours) shown inside on the right. */
function UnitInput({
  value,
  onChange,
  unit,
  min,
  max,
}: {
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  unit: string;
  min: number;
  max: number;
}) {
  return (
    <span className="relative block">
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        className={cn(inputClass, "pr-14 tabular-nums")}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
        {unit}
      </span>
    </span>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: () => void;
}) {
  const t = useT();
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-neutral-900">{t(label)}</p>
        {hint && <p className="mt-0.5 text-xs text-neutral-500">{t(hint)}</p>}
      </div>
      <Switch checked={checked} onChange={onChange} label={t(label)} />
    </div>
  );
}

export default function SettingsForm() {
  const t = useT();
  const db = useHotelDB();
  const [tab, setTab] = useState<Tab>("pricing");
  const [s, setS] = useState<Settings>(db.settings);
  const dirty = JSON.stringify(s) !== JSON.stringify(db.settings);
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    setS((x) => ({ ...x, [k]: v }));
  const num =
    (k: NumKey, min: number, max: number) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      set(k, Math.min(max, Math.max(min, Number(e.target.value) || 0)));
  const example = quoteStay(s, 3200, 2, 1);

  const save = () => {
    if (!Object.values(s.onlineMethods).some(Boolean))
      return toast.error(t("Keep at least one online payment method on."));
    saveSettings(s);
    toast.success(t("Settings saved — new bookings use them right away"));
  };

  const sections: {
    value: Tab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { value: "pricing", label: "Taxes & fees", icon: Percent },
    { value: "payments", label: "Online payment", icon: CreditCard },
    { value: "policies", label: "Check-in & cancellation", icon: Clock },
    { value: "alerts", label: "Bookings & alerts", icon: Bell },
  ];
  const current = sections.find((x) => x.value === tab)!;

  return (
    <section className="min-w-0 rounded-md border border-neutral-200 bg-white">
      {/* Phones: a section picker; wider screens: tabs. */}
      <div className="border-b border-neutral-100 p-3 sm:hidden">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger
            className={cn(hbtn.outline, "h-10 w-full justify-start gap-2 px-3")}
          >
            <SlidersHorizontal className="size-4 shrink-0 text-sky-600" />
            <span className="truncate font-semibold text-neutral-900">
              {t(current.label)}
            </span>
            <ChevronDown className="ml-auto size-4 shrink-0 text-neutral-500" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={6}
            className="w-[min(18rem,calc(100vw-2rem))] rounded-md"
          >
            {sections.map((sec) => (
              <DropdownMenuItem
                key={sec.value}
                onSelect={() => setTab(sec.value)}
                className="cursor-pointer py-2.5"
              >
                <sec.icon
                  className={cn(
                    "size-4",
                    sec.value === tab ? "text-sky-600" : "text-neutral-400"
                  )}
                />
                <span
                  className={cn(
                    sec.value === tab && "font-semibold text-sky-800"
                  )}
                >
                  {t(sec.label)}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="hidden sm:block">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={sections.map((sec) => ({ value: sec.value, label: sec.label }))}
        />
      </div>

      <div className="space-y-3 p-3 sm:space-y-4 sm:p-6">
        {tab === "pricing" && (
          <>
            <Group title="Charges added to every bill">
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                <Field label="Service charge">
                  <UnitInput
                    value={s.serviceFeeRate}
                    onChange={num("serviceFeeRate", 0, 30)}
                    unit="%"
                    min={0}
                    max={30}
                  />
                </Field>
                <Field label="VAT">
                  <UnitInput
                    value={s.vatRate}
                    onChange={num("vatRate", 0, 30)}
                    unit="%"
                    min={0}
                    max={30}
                  />
                </Field>
              </div>
            </Group>
            <div className="overflow-hidden rounded-lg border border-neutral-200 text-sm">
              <p className="border-b border-neutral-100 bg-neutral-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {t("Example — 2 nights at {amount}", { amount: taka(3200) })}
              </p>
              <dl className="divide-y divide-neutral-100">
                {[
                  [t("Room charge"), taka(example.subtotal)],
                  [
                    `${t("Service charge")} (${s.serviceFeeRate}%)`,
                    taka(example.serviceFee),
                  ],
                  [`VAT (${s.vatRate}%)`, taka(example.tax)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 px-4 py-2">
                    <dt className="text-neutral-600">{k}</dt>
                    <dd className="tabular-nums text-neutral-900">{v}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-3 bg-sky-50 px-4 py-2.5 font-semibold text-sky-900">
                  <dt>{t("Total")}</dt>
                  <dd className="tabular-nums">{taka(example.total)}</dd>
                </div>
              </dl>
            </div>
            <p className="text-xs text-neutral-500">
              {t("Existing bookings keep their price.")}
            </p>
          </>
        )}

        {tab === "payments" && (
          <>
            <Group title="Deposit">
              <Field
                label="Deposit taken online to confirm"
                hint={t(
                  "Guests pay {n}% now ({amount} in the example) or the full amount.",
                  { n: s.depositRate, amount: taka(example.deposit) }
                )}
              >
                <UnitInput
                  value={s.depositRate}
                  onChange={num("depositRate", 1, 100)}
                  unit="%"
                  min={1}
                  max={100}
                />
              </Field>
            </Group>
            <Group title="Methods offered at checkout">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {online.map((m) => {
                  const on = s.onlineMethods[m];
                  const info = paymentMethodInfo[m];
                  return (
                    <button
                      key={m}
                      type="button"
                      role="switch"
                      aria-checked={on}
                      onClick={() =>
                        set("onlineMethods", { ...s.onlineMethods, [m]: !on })
                      }
                      className={cn(
                        "flex h-16 flex-col items-center justify-center gap-1 rounded-lg border text-xs font-medium transition",
                        on
                          ? "border-sky-600 bg-sky-50 text-sky-800 ring-1 ring-sky-600"
                          : "border-neutral-200 text-neutral-500 opacity-70 hover:opacity-100"
                      )}
                    >
                      {info.logos.length ? (
                        <Image
                          src={info.logos[0]}
                          alt=""
                          width={56}
                          height={20}
                          className={cn(
                            "h-5 w-14 object-contain",
                            !on && "grayscale"
                          )}
                        />
                      ) : (
                        <CreditCard className="size-5" />
                      )}
                      {t(info.label)}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-neutral-500">
                {t(
                  "Demo: payments are simulated. Connect a gateway such as SSLCommerz or bKash PGW before taking real money."
                )}
              </p>
            </Group>
          </>
        )}

        {tab === "policies" && (
          <>
            <Group title="Check-in & check-out">
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                <Field label="Check-in from">
                  <select
                    value={s.checkInTime}
                    onChange={(e) => set("checkInTime", e.target.value)}
                    className={inputClass}
                  >
                    {times.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Check-out until">
                  <select
                    value={s.checkOutTime}
                    onChange={(e) => set("checkOutTime", e.target.value)}
                    className={inputClass}
                  >
                    {times.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </Group>
            <Group title="Cancellation & refunds">
              <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
                <Field
                  label="Free cancellation until"
                  hint="Hours before check-in · 0 turns it off"
                >
                  <UnitInput
                    value={s.freeCancellationHours}
                    onChange={num("freeCancellationHours", 0, 720)}
                    unit={t("hours")}
                    min={0}
                    max={720}
                  />
                </Field>
                <Field
                  label="Late cancellation / no-show fee"
                  hint="Of the total · never more than paid"
                >
                  <UnitInput
                    value={s.lateCancellationFeeRate}
                    onChange={num("lateCancellationFeeRate", 0, 100)}
                    unit="%"
                    min={0}
                    max={100}
                  />
                </Field>
                <Field
                  label="Refund fee"
                  hint="Kept from each refund · staff can waive it"
                >
                  <UnitInput
                    value={s.refundFeeRate ?? 10}
                    onChange={num("refundFeeRate", 0, 100)}
                    unit="%"
                    min={0}
                    max={100}
                  />
                </Field>
              </div>
            </Group>
          </>
        )}

        {tab === "alerts" && (
          <Group title="Bookings & alerts">
            <div className="divide-y divide-neutral-100">
              <Toggle
                label="Confirm online bookings manually"
                hint="Off: website bookings confirm instantly. On: they wait in “To confirm” until staff approve them."
                checked={s.requireConfirmation}
                onChange={() =>
                  set("requireConfirmation", !s.requireConfirmation)
                }
              />
              <Toggle
                label="Sound on new notifications"
                hint="A short chime in open admin tabs."
                checked={s.notifySound}
                onChange={() => set("notifySound", !s.notifySound)}
              />
              <Toggle
                label="Desktop alerts"
                hint="Browser notifications while the admin tab is in the background. Turn on from Notifications to grant permission."
                checked={s.browserNotifications}
                onChange={() =>
                  set("browserNotifications", !s.browserNotifications)
                }
              />
            </div>
          </Group>
        )}
      </div>

      {/* Save bar: always at the bottom; turns blue once something has changed. */}
      {
        <div
          className={cn(
            "sticky bottom-0 flex items-center justify-between gap-2 rounded-b-md border-t px-3 py-2.5 backdrop-blur sm:px-6 sm:py-3",
            dirty
              ? "border-sky-200 bg-sky-50/95"
              : "border-neutral-100 bg-white/95"
          )}
        >
          <p
            className={cn(
              "min-w-0 truncate text-[13px] sm:text-sm",
              dirty ? "font-medium text-sky-900" : "text-neutral-500"
            )}
          >
            {dirty ? t("You have unsaved changes.") : t("All changes saved")}
          </p>
          <div className="flex shrink-0 gap-2">
            {dirty && (
              <button
                onClick={() => setS(db.settings)}
                className={cn(hbtn.outline, "bg-white")}
              >
                {t("Discard")}
              </button>
            )}
            <button onClick={save} disabled={!dirty} className={hbtn.primary}>
              <span className="sm:hidden">{t("Save")}</span>
              <span className="hidden sm:inline">{t("Save changes")}</span>
            </button>
          </div>
        </div>
      }
    </section>
  );
}
