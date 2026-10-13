"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { roleLabels } from "@/src/lib/hotel-store/format";
import { logIn, useCurrentStaff } from "@/src/lib/hotel-store/store";
import type { StaffRole } from "@/src/lib/hotel-store/types";
import { ADMIN, inputClass, labelClass } from "./ui";

const demo: { role: StaffRole; email: string; password: string; can: string }[] = [
  { role: "admin", email: "admin@tripwave.com", password: "admin123", can: "Everything, incl. staff & settings" },
  { role: "manager", email: "manager@tripwave.com", password: "manager123", can: "Front office, refunds, website content" },
  { role: "receptionist", email: "frontdesk@tripwave.com", password: "desk123", can: "Bookings, check-in/out, payments" },
];

export default function StaffLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("next");
  const next = raw && raw.startsWith(ADMIN) && raw !== `${ADMIN}/login` ? raw : ADMIN;
  const staff = useCurrentStaff();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (staff) router.replace(next);
  }, [staff, next, router]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    await new Promise((r) => setTimeout(r, 300));
    const result = logIn(email, password, "staff");
    setBusy(false);
    if (!result.ok) return setError(result.error);
    toast.success(`Welcome, ${result.value.name.split(" ")[0]}`);
  };

  return (
    <div className="grid min-h-screen bg-neutral-50 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-sky-950 lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative photo */}
        <img
          src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80&auto=format&fit=crop"
          alt=""
          aria-hidden
          className="absolute inset-0 size-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sky-950 via-sky-950/60 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <Image src="/TripWaveLogo-light.webp" alt="TripWave" width={614} height={192} className="h-12 w-auto" />
          <div>
            <p className="text-3xl font-bold leading-tight">
              Run the whole hotel
              <br />
              from one screen.
            </p>
            <p className="mt-3 max-w-md text-sky-100/80">
              Live bookings and payments, who is in which room, housekeeping, guests, website content and reviews.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link href="/hotel-management" className="mb-8 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-sky-700">
            <ArrowLeft className="size-4" /> Back to website
          </Link>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
            <ShieldCheck className="size-6 text-sky-600" /> Staff login
          </h1>
          <p className="mt-1 text-sm text-neutral-500">Sign in with your hotel staff account.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className={labelClass}>Email</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="username" className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Password</span>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" className={inputClass} />
            </label>
            {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            <button disabled={busy} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60">
              {busy && <Loader2 className="size-4 animate-spin" />} Sign in
            </button>
          </form>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Demo accounts — click to fill</p>
            <ul className="mt-2 space-y-2">
              {demo.map((d) => (
                <li key={d.role}>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(d.email);
                      setPassword(d.password);
                    }}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-left text-xs transition hover:border-sky-300"
                  >
                    <span className="flex justify-between font-semibold text-neutral-800">
                      {roleLabels[d.role]} <span className="font-mono font-normal text-neutral-500">{d.password}</span>
                    </span>
                    <span className="block text-neutral-500">
                      {d.email} · {d.can}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
