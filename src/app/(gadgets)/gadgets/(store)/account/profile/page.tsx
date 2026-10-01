"use client";

import { useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Camera, MapPin, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { toast } from "react-toastify";
import { currentUser, updateProfile, useGadgetDB } from "@/src/lib/gadget-store/store";
import { formatDate } from "@/src/lib/gadget-store/format";
import { cn } from "@/src/lib/utils";
import ControlledInputField from "@/src/components/shared/FromController/ControlledInputField";
import ControlledSelectField from "@/src/components/shared/FromController/ControlledSelectField";
import InputLabel from "@/src/components/shared/InputLabel";
import GadgetAvatar from "@/src/components/gadgets/GadgetAvatar";
import { checkoutCities } from "@/src/components/gadgets/checkoutSchema";
import { profileSchema, type ProfileFormValues } from "@/src/components/gadgets/account/profileSchema";

const fieldClass =
  "h-11 rounded-xl border-neutral-200 bg-neutral-50 px-3.5 text-sm shadow-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100";
const labelClass = "mb-1.5 text-sm font-medium text-neutral-700";

const MAX_UPLOAD = 5 * 1024 * 1024;
const AVATAR_SIZE = 256;

/** Center-crops an image file to a small square JPEG data URL so it fits comfortably in localStorage. */
function toAvatarDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = AVATAR_SIZE;
      canvas
        .getContext("2d")!
        .drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

export default function AccountProfilePage() {
  const db = useGadgetDB();
  const user = currentUser(db);
  const fileRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user.name,
      phone: user.phone,
      email: user.email,
      city: checkoutCities.includes(user.city) ? user.city : "Dhaka",
      address: user.address,
    },
  });
  const { isDirty, isSubmitting } = form.formState;

  const save = (values: ProfileFormValues) => {
    updateProfile(values);
    form.reset(values);
    toast.success("Profile updated");
  };

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file");
    if (file.size > MAX_UPLOAD) return toast.error("Image must be smaller than 5MB");
    try {
      updateProfile({ avatar: await toAvatarDataUrl(file) });
      toast.success("Profile photo updated");
    } catch {
      toast.error("Could not read that image");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl">Profile Settings</h1>
        <p className="mt-1 text-sm text-neutral-500">Update your photo, contact details and default delivery address.</p>
      </div>

      <Card icon={Camera} title="Profile photo" subtitle="Shown on your account and in the header.">
        <div className="flex flex-wrap items-center gap-5">
          <GadgetAvatar
            user={user}
            className="size-24 border border-neutral-200 bg-orange-100 text-3xl font-bold text-orange-600"
          />
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-10 items-center gap-2 rounded-full bg-neutral-900 px-5 text-sm font-semibold text-white transition hover:bg-orange-500"
              >
                <Camera className="size-4" /> {user.avatar ? "Change photo" : "Upload photo"}
              </button>
              {user.avatar && (
                <button
                  type="button"
                  onClick={() => {
                    updateProfile({ avatar: undefined });
                    toast.success("Profile photo removed");
                  }}
                  className="flex h-10 items-center gap-2 rounded-full border border-neutral-200 px-5 text-sm font-medium text-neutral-700 transition hover:border-rose-300 hover:text-rose-600"
                >
                  <Trash2 className="size-4" /> Remove
                </button>
              )}
            </div>
            <p className="text-xs text-neutral-500">JPG, PNG or WebP, up to 5MB. It will be cropped to a square.</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} className="hidden" />
        </div>
      </Card>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(save)} noValidate className="space-y-6">
          <Card icon={UserRound} title="Personal information" subtitle="We use these to contact you about your orders.">
            <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <InputLabel label="Full name" required className={labelClass} />
                <ControlledInputField name="name" placeholder="Your full name" className={fieldClass} />
              </div>
              <div>
                <InputLabel label="Phone" required className={labelClass} />
                <ControlledInputField name="phone" type="tel" placeholder="01XXX-XXXXXX" className={fieldClass} />
              </div>
              <div>
                <InputLabel label="Email" className={labelClass} />
                <ControlledInputField name="email" type="email" placeholder="you@example.com" className={fieldClass} />
              </div>
            </div>
          </Card>

          <Card icon={MapPin} title="Default delivery address" subtitle="Pre-filled at checkout. You can still change it per order.">
            <div className="grid gap-x-4 gap-y-5 sm:grid-cols-[200px_1fr]">
              <div>
                <InputLabel label="City" required className={labelClass} />
                <ControlledSelectField
                  name="city"
                  placeholder="Select city"
                  options={checkoutCities.map((c) => ({ label: c, value: c }))}
                  className={fieldClass}
                />
              </div>
              <div>
                <InputLabel label="Address" className={labelClass} />
                <ControlledInputField name="address" placeholder="House, road, area" className={fieldClass} />
              </div>
            </div>
          </Card>

          <div
            className={cn(
              "sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 transition",
              isDirty ? "border-orange-200 bg-orange-50 shadow-lg" : "border-neutral-200 bg-white"
            )}
          >
            <p className="text-sm text-neutral-600">{isDirty ? "You have unsaved changes." : "All changes saved."}</p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!isDirty}
                onClick={() => form.reset()}
                className="h-10 rounded-full border border-neutral-200 bg-white px-5 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 disabled:opacity-40"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={!isDirty || isSubmitting}
                className="h-10 rounded-full bg-orange-500 px-6 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition hover:bg-orange-600 disabled:opacity-40 disabled:shadow-none"
              >
                Save changes
              </button>
            </div>
          </div>
        </form>
      </FormProvider>

      <Card icon={ShieldCheck} title="Account">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-neutral-500">Customer ID</dt>
            <dd className="mt-0.5 font-medium text-neutral-900">{user.id.toUpperCase()}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Member since</dt>
            <dd className="mt-0.5 font-medium text-neutral-900">{formatDate(user.joinedAt)}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3 border-b border-neutral-100 pb-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
          <Icon className="size-4.5" />
        </span>
        <div>
          <h2 className="font-semibold text-neutral-900">{title}</h2>
          {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}
