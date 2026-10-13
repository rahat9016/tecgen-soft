"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { RotateCcw } from "lucide-react";
import { taka } from "@/src/lib/hotel-store/format";
import { defaultSettings } from "@/src/lib/hotel-store/seed";
import { quoteStay, resetDemoData, saveSettings, useHotelDB } from "@/src/lib/hotel-store/store";
import type { OnlineMethod, Settings } from "@/src/lib/hotel-store/types";
import { paymentMethodInfo } from "@/src/lib/hotelPayment";
import { AdminHeader, Card, Field, hbtn, inputClass, Switch } from "./ui";

const times = ["10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];
const online: OnlineMethod[] = ["bkash", "nagad", "rocket", "card"];

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-neutral-900">{label}</p>
        {hint && <p className="text-xs text-neutral-500">{hint}</p>}
      </div>
      <Switch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

export default function SettingsForm() {
  const db = useHotelDB();
  const [s, setS] = useState<Settings>(db.settings);
  const dirty = JSON.stringify(s) !== JSON.stringify(db.settings);
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((x) => ({ ...x, [k]: v }));
  const num = (k: "serviceFeeRate" | "vatRate" | "depositRate" | "freeCancellationHours" | "lateCancellationFeeRate", min: number, max: number) => (e: React.ChangeEvent<HTMLInputElement>) =>
    set(k, Math.min(max, Math.max(min, Number(e.target.value) || 0)));
  const example = quoteStay(s, 3200, 2, 1);

  const save = () => {
    if (!Object.values(s.onlineMethods).some(Boolean)) return toast.error("Keep at least one online payment method on.");
    saveSettings(s);
    toast.success("Settings saved — new bookings use them right away");
  };

  return (
    <div>
      <AdminHeader
        title="Settings"
        subtitle="Prices, payment rules and policies the website and front desk both follow."
        actions={
          <>
            {dirty && (
              <button onClick={() => setS(db.settings)} className={hbtn.outline}>
                Discard
              </button>
            )}
            <button onClick={save} disabled={!dirty} className={hbtn.primary}>
              Save settings
            </button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-neutral-900">Taxes & fees</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Service charge (%)">
              <input type="number" min={0} max={30} value={s.serviceFeeRate} onChange={num("serviceFeeRate", 0, 30)} className={inputClass} />
            </Field>
            <Field label="VAT (%)">
              <input type="number" min={0} max={30} value={s.vatRate} onChange={num("vatRate", 0, 30)} className={inputClass} />
            </Field>
          </div>
          <p className="mt-4 rounded-xl bg-neutral-50 p-3 text-xs text-neutral-600">
            Example — 2 nights at {taka(3200)}: room {taka(example.subtotal)} + service {taka(example.serviceFee)} + VAT {taka(example.tax)} = <b>{taka(example.total)}</b>. Existing bookings keep their price.
          </p>
        </Card>

        <Card>
          <h2 className="font-semibold text-neutral-900">Online payment</h2>
          <div className="mt-4">
            <Field label="Deposit taken online to confirm (%)" hint={`Guests pay ${s.depositRate}% now (${taka(example.deposit)} in the example) or the full amount.`}>
              <input type="number" min={1} max={100} value={s.depositRate} onChange={num("depositRate", 1, 100)} className={inputClass} />
            </Field>
          </div>
          <p className="mt-4 text-xs font-medium text-neutral-600">Methods offered at checkout</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {online.map((m) => (
              <label key={m} className="flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-sm has-[:checked]:border-sky-400 has-[:checked]:bg-sky-50">
                <input type="checkbox" checked={s.onlineMethods[m]} onChange={() => set("onlineMethods", { ...s.onlineMethods, [m]: !s.onlineMethods[m] })} className="size-4 accent-sky-600" />
                {paymentMethodInfo[m].label}
              </label>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-neutral-400">Demo: payments are simulated. Connect a gateway such as SSLCommerz or bKash PGW before taking real money.</p>
        </Card>

        <Card>
          <h2 className="font-semibold text-neutral-900">Check-in & cancellation</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Check-in from">
              <select value={s.checkInTime} onChange={(e) => set("checkInTime", e.target.value)} className={inputClass}>
                {times.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Check-out until">
              <select value={s.checkOutTime} onChange={(e) => set("checkOutTime", e.target.value)} className={inputClass}>
                {times.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Free cancellation until (hours before check-in)" hint="0 turns free cancellation off">
              <input type="number" min={0} max={720} value={s.freeCancellationHours} onChange={num("freeCancellationHours", 0, 720)} className={inputClass} />
            </Field>
            <Field label="Late cancellation / no-show fee (% of total)" hint="Never more than the guest has paid">
              <input type="number" min={0} max={100} value={s.lateCancellationFeeRate} onChange={num("lateCancellationFeeRate", 0, 100)} className={inputClass} />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-neutral-900">Bookings & alerts</h2>
          <div className="mt-2 divide-y divide-neutral-100">
            <Toggle
              label="Confirm online bookings manually"
              hint="Off: website bookings confirm instantly. On: they wait in “To confirm” until staff approve them."
              checked={s.requireConfirmation}
              onChange={() => set("requireConfirmation", !s.requireConfirmation)}
            />
            <Toggle label="Sound on new notifications" hint="A short chime in open admin tabs." checked={s.notifySound} onChange={() => set("notifySound", !s.notifySound)} />
            <Toggle
              label="Desktop alerts"
              hint="Browser notifications while the admin tab is in the background. Turn on from Notifications to grant permission."
              checked={s.browserNotifications}
              onChange={() => set("browserNotifications", !s.browserNotifications)}
            />
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-neutral-900">Demo data</h2>
              <p className="text-xs text-neutral-500">Everything is stored in this browser. Resetting restores the sample hotel, bookings, guests and payments.</p>
            </div>
            <button
              onClick={() => {
                if (!confirm("Reset all demo data? Bookings, guests, payments, content and settings go back to the sample.")) return;
                resetDemoData();
                setS(defaultSettings);
                toast.success("Demo data reset");
              }}
              className={hbtn.danger}
            >
              <RotateCcw className="size-4" /> Reset demo data
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
