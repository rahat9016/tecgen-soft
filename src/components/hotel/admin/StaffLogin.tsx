"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import {
  BedDouble,
  CalendarCheck,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { roleLabels } from "@/src/lib/hotel-store/format";
import { logIn, useCurrentStaff } from "@/src/lib/hotel-store/store";
import type { StaffRole } from "@/src/lib/hotel-store/types";
import ControlledInputField from "@/src/components/shared/FromController/ControlledInputField";
import { ADMIN, labelClass } from "./ui";

const features = [
  { icon: CalendarCheck, label: "Live bookings" },
  { icon: BedDouble, label: "Room status" },
  { icon: CreditCard, label: "Payments" },
  { icon: Sparkles, label: "Housekeeping" },
];

const schema = yup.object({
  email: yup
    .string()
    .trim()
    .required("Enter your email")
    .email("Enter a valid email"),
  password: yup.string().required("Enter your password"),
});
type LoginValues = yup.InferType<typeof schema>;

/** Icons sit over the 44px-high input, pinned to its centre so an error message below doesn't shift them. */
const fieldIcon =
  "pointer-events-none absolute left-3 top-3.5 z-10 size-4 text-neutral-400";
const fieldClass = "pl-9 focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

const demo: {
  role: StaffRole;
  email: string;
  password: string;
  can: string;
  tone: string;
}[] = [
  {
    role: "admin",
    email: "admin@tripwave.com",
    password: "admin123",
    can: "Everything, incl. staff & settings",
    tone: "bg-violet-100 text-violet-700",
  },
  {
    role: "manager",
    email: "manager@tripwave.com",
    password: "manager123",
    can: "Front office, refunds, website content",
    tone: "bg-amber-100 text-amber-700",
  },
  {
    role: "receptionist",
    email: "frontdesk@tripwave.com",
    password: "desk123",
    can: "Bookings, check-in/out, payments",
    tone: "bg-emerald-100 text-emerald-700",
  },
];

export default function StaffLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("next");
  const next =
    raw && raw.startsWith(ADMIN) && raw !== `${ADMIN}/login` ? raw : ADMIN;
  const staff = useCurrentStaff();
  const methods = useForm<LoginValues>({
    resolver: yupResolver(schema),
    defaultValues: { email: "", password: "" },
  });
  const email = useWatch({ control: methods.control, name: "email" });
  const busy = methods.formState.isSubmitting;
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (staff) router.replace(next);
  }, [staff, next, router]);

  const submit = async ({ email, password }: LoginValues) => {
    setError("");
    await new Promise((r) => setTimeout(r, 300));
    const result = logIn(email, password, "staff");
    if (!result.ok) return setError(result.error);
    toast.success(`Welcome, ${result.value.name.split(" ")[0]}`);
  };

  return (
    <div className="grid h-dvh overflow-hidden bg-neutral-50 lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-sky-950 lg:block">
        <Image
          src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80&auto=format&fit=crop"
          alt=""
          aria-hidden
          fill
          priority
          sizes="55vw"
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-sky-950/80 via-sky-950/50 to-sky-950" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white xl:p-12">
          <Image
            src="/TripWaveLogo-light.webp"
            alt="TripWave"
            width={614}
            height={192}
            className="h-10 w-auto self-start"
            priority
          />

          <div className="max-w-lg pb-6">
            <h2 className="text-4xl font-bold leading-tight tracking-tight">
              Run the whole hotel from one screen.
            </h2>
            <p className="mt-4 text-base text-sky-100/80">
              Live bookings and payments, who is in which room, housekeeping,
              guests, website content and reviews.
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-3">
              {features.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm backdrop-blur"
                >
                  <span className="grid size-8 place-items-center rounded-md bg-sky-500/20 text-sky-300">
                    <Icon className="size-4" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      <main className="flex h-dvh flex-col overflow-y-auto px-6 py-5 sm:px-10">
        <Image
          src="/TripWaveLogo.webp"
          alt="TripWave"
          width={614}
          height={192}
          className="h-8 w-auto self-start lg:hidden"
        />

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-4">
          <div className="grid size-10 place-items-center rounded-xl bg-sky-100 text-sky-600">
            <ShieldCheck className="size-5" />
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-neutral-900">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Sign in with your hotel staff account to continue.
          </p>

          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(submit)}
              noValidate
              className="mt-5 space-y-4"
            >
              <div>
                <span className={labelClass}>Email address</span>
                <div className="relative">
                  <Mail className={fieldIcon} />
                  <ControlledInputField
                    name="email"
                    type="email"
                    placeholder="you@tripwave.com"
                    className={fieldClass}
                  />
                </div>
              </div>
              <div>
                <span className={labelClass}>Password</span>
                <div className="relative">
                  <Lock className={fieldIcon} />
                  <ControlledInputField
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`${fieldClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-2 top-2 z-10 grid size-7 place-items-center rounded text-neutral-400 hover:text-neutral-700"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>
              {error && (
                <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </p>
              )}
              <button
                disabled={busy}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-sky-600 text-sm font-semibold text-white shadow-sm shadow-sky-600/30 transition hover:bg-sky-700 disabled:opacity-60"
              >
                {busy && <Loader2 className="size-4 animate-spin" />} Sign in
              </button>
            </form>
          </FormProvider>

          <div className="mt-6">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-neutral-200" />
              <p className="text-xs font-medium text-neutral-400">
                Demo accounts — click to fill
              </p>
              <span className="h-px flex-1 bg-neutral-200" />
            </div>
            <ul className="mt-3 space-y-2">
              {demo.map((d) => {
                const active = email === d.email;
                return (
                  <li key={d.role}>
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        methods.reset({ email: d.email, password: d.password });
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg border bg-white px-3 py-2 text-left transition hover:border-sky-300 hover:shadow-sm ${
                        active
                          ? "border-sky-500 ring-2 ring-sky-100"
                          : "border-neutral-200"
                      }`}
                    >
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-md text-sm font-semibold ${d.tone}`}
                      >
                        {roleLabels[d.role].charAt(0)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2 text-sm font-semibold text-neutral-800">
                          {roleLabels[d.role]}
                          <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[11px] font-normal text-neutral-500">
                            {d.password}
                          </code>
                        </span>
                        <span className="block truncate text-xs text-neutral-500">
                          {d.email} ·{" "}
                          <span className="text-neutral-400">{d.can}</span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <p className="text-center text-xs text-neutral-400">
          © {new Date().getFullYear()} TripWave Hotel &amp; Resort. Staff access
          only.
        </p>
      </main>
    </div>
  );
}
