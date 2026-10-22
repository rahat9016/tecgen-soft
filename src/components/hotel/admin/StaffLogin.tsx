"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { Check, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { roleLabels } from "@/src/lib/hotel-store/format";
import { logIn, useCurrentStaff } from "@/src/lib/hotel-store/store";
import type { StaffRole } from "@/src/lib/hotel-store/types";
import ControlledInputField from "@/src/components/shared/FromController/ControlledInputField";
import { ADMIN, labelClass } from "./ui";

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
}[] = [
  {
    role: "admin",
    email: "admin@tripwave.com",
    password: "admin123",
    can: "Everything, incl. staff & settings",
  },
  {
    role: "manager",
    email: "manager@tripwave.com",
    password: "manager123",
    can: "Front office, refunds, website content",
  },
  {
    role: "receptionist",
    email: "frontdesk@tripwave.com",
    password: "desk123",
    can: "Bookings, check-in/out, payments",
  },
];

export default function StaffLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("next");
  const next =
    raw && raw.startsWith(ADMIN) && raw !== `${ADMIN}/login`
      ? raw
      : `${ADMIN}/bookings`;
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
    <div className="grid h-dvh overflow-hidden bg-white lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-sky-950 lg:block">
        <Image
          src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80&auto=format&fit=crop"
          alt=""
          aria-hidden
          fill
          priority
          sizes="55vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sky-950 via-sky-950/40 to-sky-950/30" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white xl:p-14">
          <Image
            src="/TripWaveLogo-light.webp"
            alt="TripWave"
            width={614}
            height={192}
            className="h-10 w-auto self-start"
            priority
          />
          <div className="max-w-md">
            <h2 className="text-4xl font-bold leading-[1.15] tracking-tight xl:text-5xl">
              Run the whole hotel from one screen.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/75">
              Bookings, payments, rooms and guests — all in one place for your
              front desk team.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex h-dvh flex-col overflow-y-auto px-6 py-6 sm:px-10">
        <Image
          src="/TripWaveLogo.webp"
          alt="TripWave"
          width={614}
          height={192}
          className="h-8 w-auto self-start lg:hidden"
        />

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-8">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Sign in to your staff account.
          </p>

          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(submit)}
              noValidate
              className="mt-8 space-y-5"
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
                    placeholder="Enter your password"
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
                className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-sky-600 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
              >
                {busy && <Loader2 className="size-4 animate-spin" />} Sign in
              </button>
            </form>
          </FormProvider>

          <div className="mt-10 rounded-lg bg-neutral-50 p-4">
            <p className="text-xs font-medium text-neutral-500">
              Demo login — pick a role to fill the form
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {demo.map((d) => {
                const active = email === d.email;
                return (
                  <button
                    key={d.role}
                    type="button"
                    title={`${d.email} — ${d.can}`}
                    onClick={() => {
                      setError("");
                      methods.reset({ email: d.email, password: d.password });
                    }}
                    className={`relative flex h-10 items-center justify-center gap-1.5 rounded-md border px-2 text-[13px] font-medium transition ${
                      active
                        ? "border-sky-600 bg-white text-sky-700 ring-1 ring-sky-600"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-sky-300"
                    }`}
                  >
                    {active && <Check className="size-3.5 shrink-0" />}
                    <span className="truncate">{roleLabels[d.role]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-neutral-400">
          {`© ${new Date().getFullYear()} TripWave Hotel & Resort · Staff access only`}
        </p>
      </main>
    </div>
  );
}
