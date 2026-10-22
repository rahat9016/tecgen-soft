"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import {
  CalendarCheck,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  Receipt,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { logIn, signUp, useCurrentGuest } from "@/src/lib/hotel-store/store";

const inputClass =
  "h-12 w-full rounded-lg border border-neutral-200 bg-neutral-50/60 pl-10 pr-3.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100";
const iconClass =
  "pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400";
const labelText = "mb-1.5 block text-sm font-medium text-neutral-800";

const perks = [
  { icon: CalendarCheck, text: "All your bookings in one place" },
  { icon: Receipt, text: "Download receipts any time" },
  { icon: Zap, text: "Faster booking next time" },
];

/** Only same-site paths, so a crafted ?next= link can't bounce guests to another website. */
const safeNext = (next: string | null) =>
  next && next.startsWith("/hotel-management")
    ? next
    : "/hotel-management/my-bookings";

export default function GuestAuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const user = useCurrentGuest();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && !busy) router.replace(next);
  }, [user, busy, next, router]);

  const set =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    await new Promise((r) => setTimeout(r, 400));
    const result =
      mode === "login"
        ? logIn(form.email, form.password, "guest")
        : signUp(form);
    if (!result.ok) {
      setBusy(false);
      setError(result.error);
      return;
    }
    toast.success(
      mode === "login"
        ? `Welcome back, ${result.value.name.split(" ")[0]}!`
        : "Account created — welcome aboard!"
    );
    router.replace(next);
  };

  const otherHref = `/hotel-management/${mode === "login" ? "signup" : "login"}${params.get("next") ? `?next=${encodeURIComponent(next)}` : ""}`;

  const login = mode === "login";

  return (
    <div className="container flex min-h-[75vh] items-center justify-center py-10 md:py-16">
      <div className="grid w-full overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-2xl shadow-sky-950/10 md:grid-cols-2">
        <aside className="relative hidden min-h-[560px] md:block">
          <Image
            src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80&auto=format&fit=crop"
            alt=""
            aria-hidden
            fill
            sizes="(min-width: 768px) 50vw, 0px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sky-950/95 via-sky-950/50 to-sky-950/10" />
          <div className="absolute inset-x-0 bottom-0 p-8 text-white lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
              TripWave Hotel
            </p>
            <h2 className="mt-2 text-3xl font-bold leading-tight">
              {login
                ? "Your next stay starts here."
                : "Join and book in seconds."}
            </h2>
            <ul className="mt-6 space-y-3">
              {perks.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-3 text-sm text-white/90"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur">
                    <Icon className="size-4" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
          <div className="mx-auto w-full max-w-md">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
              {login ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">
              {login
                ? "Log in to see your bookings, receipts and updates from the hotel."
                : "Booked before? Use the same email and your past bookings move into your account."}
            </p>

            {login && (
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    email: "tamim@example.com",
                    password: "guest123",
                  }))
                }
                className="mt-6 flex w-full items-center gap-3 rounded-lg bg-sky-50 px-3.5 py-2.5 text-left text-xs text-sky-900 transition hover:bg-sky-100"
              >
                <Sparkles className="size-4 shrink-0 text-sky-600" />
                <span>
                  <span className="font-semibold">Try the demo guest</span> —
                  tamim@example.com / guest123
                </span>
              </button>
            )}

            <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
              {!login && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className={labelText}>Full name</span>
                    <span className="relative block">
                      <User className={iconClass} />
                      <input
                        value={form.name}
                        onChange={set("name")}
                        autoComplete="name"
                        placeholder="e.g. Tamim Rahman"
                        className={inputClass}
                      />
                    </span>
                  </label>
                  <label className="block">
                    <span className={labelText}>
                      Mobile{" "}
                      <span className="font-normal text-neutral-400">
                        (optional)
                      </span>
                    </span>
                    <span className="relative block">
                      <Phone className={iconClass} />
                      <input
                        value={form.phone}
                        onChange={set("phone")}
                        type="tel"
                        autoComplete="tel"
                        placeholder="+880 17XX-XXXXXX"
                        className={inputClass}
                      />
                    </span>
                  </label>
                </div>
              )}
              <label className="block">
                <span className={labelText}>Email</span>
                <span className="relative block">
                  <Mail className={iconClass} />
                  <input
                    value={form.email}
                    onChange={set("email")}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </span>
              </label>
              <label className="block">
                <span className={labelText}>Password</span>
                <span className="relative block">
                  <Lock className={iconClass} />
                  <input
                    value={form.password}
                    onChange={set("password")}
                    type={show ? "text" : "password"}
                    autoComplete={login ? "current-password" : "new-password"}
                    placeholder={
                      login ? "Your password" : "At least 6 characters"
                    }
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-neutral-400 hover:text-neutral-700"
                  >
                    {show ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </span>
              </label>

              {error && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-sky-600 text-sm font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:bg-sky-700 disabled:opacity-70"
              >
                {busy && <Loader2 className="size-4 animate-spin" />}
                {login ? "Log in" : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-neutral-500">
              {login ? "New to TripWave?" : "Already have an account?"}{" "}
              <Link
                href={otherHref}
                className="font-semibold text-sky-700 hover:underline"
              >
                {login ? "Create an account" : "Log in"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
