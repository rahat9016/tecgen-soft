"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { logIn, signUp, useCurrentGuest } from "@/src/lib/hotel-store/store";

const inputClass =
  "h-11 w-full rounded-md border border-neutral-200 bg-white px-3.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

/** Only same-site paths, so a crafted ?next= link can't bounce guests to another website. */
const safeNext = (next: string | null) => (next && next.startsWith("/hotel-management") ? next : "/hotel-management/my-bookings");

export default function GuestAuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const user = useCurrentGuest();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && !busy) router.replace(next);
  }, [user, busy, next, router]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    await new Promise((r) => setTimeout(r, 400));
    const result = mode === "login" ? logIn(form.email, form.password, "guest") : signUp(form);
    if (!result.ok) {
      setBusy(false);
      setError(result.error);
      return;
    }
    toast.success(mode === "login" ? `Welcome back, ${result.value.name.split(" ")[0]}!` : "Account created — welcome aboard!");
    router.replace(next);
  };

  const otherHref = `/hotel-management/${mode === "login" ? "signup" : "login"}${params.get("next") ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="rounded-md border border-neutral-200/80 bg-white p-6 shadow-xl shadow-neutral-900/5 md:p-8">
          <h1 className="text-2xl font-bold text-neutral-900">{mode === "login" ? "Log in" : "Create your account"}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {mode === "login"
              ? "See your bookings, receipts and live updates from the hotel."
              : "Booked before? Use the same email and your past bookings move into your account."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            {mode === "signup" && (
              <>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-neutral-800">Full name</span>
                  <input value={form.name} onChange={set("name")} autoComplete="name" placeholder="e.g. Tamim Rahman" className={inputClass} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-neutral-800">
                    Mobile number <span className="font-normal text-neutral-400">(optional)</span>
                  </span>
                  <input value={form.phone} onChange={set("phone")} type="tel" autoComplete="tel" placeholder="+880 17XX-XXXXXX" className={inputClass} />
                </label>
              </>
            )}
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-neutral-800">Email</span>
              <input value={form.email} onChange={set("email")} type="email" autoComplete="email" placeholder="you@example.com" className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-neutral-800">Password</span>
              <span className="relative block">
                <input
                  value={form.password}
                  onChange={set("password")}
                  type={show ? "text" : "password"}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-neutral-400 hover:text-neutral-700"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </span>
            </label>

            {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-sky-600 text-sm font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:bg-sky-700 disabled:opacity-70"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-neutral-500">
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <Link href={otherHref} className="font-semibold text-sky-700 hover:underline">
              {mode === "login" ? "Create an account" : "Log in"}
            </Link>
          </p>
        </div>

        {mode === "login" && (
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, email: "tamim@example.com", password: "guest123" }))}
            className="mt-4 flex w-full items-center gap-3 rounded-md border border-dashed border-sky-200 bg-sky-50/60 p-3 text-left text-xs text-sky-900 transition hover:bg-sky-50"
          >
            <Sparkles className="size-4 shrink-0 text-sky-600" />
            <span>
              <span className="font-semibold">Demo guest:</span> tamim@example.com / guest123 — click to fill. Has a past stay to review
              and an upcoming one.
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
