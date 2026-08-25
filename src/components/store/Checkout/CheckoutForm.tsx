"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Banknote, CreditCard, Smartphone } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/src/lib/redux/hooks";
import { clearCart, setLastOrderId } from "@/src/lib/redux/features/cart/cartSlice";
import {
  checkoutValidationSchema,
  type CheckoutFormType,
} from "./schema/CheckoutSchema";

const paymentOptions = [
  { value: "cod", label: "ক্যাশ অন ডেলিভারি", icon: Banknote },
  { value: "card", label: "কার্ড পেমেন্ট", icon: CreditCard },
  { value: "mobile-banking", label: "মোবাইল ব্যাংকিং", icon: Smartphone },
] as const;

export default function CheckoutForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormType>({
    resolver: yupResolver(checkoutValidationSchema),
    defaultValues: { paymentMethod: "cod" },
  });

  const paymentMethod = watch("paymentMethod");

  const onSubmit = async () => {
    if (items.length === 0) return;
    const orderId = `FS-${Date.now().toString().slice(-8)}`;
    dispatch(setLastOrderId(orderId));
    dispatch(clearCart());
    router.push(`/order-success?orderId=${orderId}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-neutral-900">ডেলিভারি তথ্য</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            placeholder="পুরো নাম"
            error={errors.fullName?.message}
            showErrorMessage
            {...register("fullName")}
          />
          <Input
            placeholder="ফোন নম্বর (01XXXXXXXXX)"
            error={errors.phone?.message}
            showErrorMessage
            {...register("phone")}
          />
          <Input
            placeholder="ইমেইল (ঐচ্ছিক)"
            className="sm:col-span-2"
            error={errors.email?.message}
            showErrorMessage
            {...register("email")}
          />
          <Input
            placeholder="সম্পূর্ণ ঠিকানা"
            className="sm:col-span-2"
            error={errors.address?.message}
            showErrorMessage
            {...register("address")}
          />
          <Input
            placeholder="শহর"
            error={errors.city?.message}
            showErrorMessage
            {...register("city")}
          />
          <Input
            placeholder="এলাকা / থানা"
            error={errors.area?.message}
            showErrorMessage
            {...register("area")}
          />
          <Input
            placeholder="পোস্টাল কোড"
            error={errors.postalCode?.message}
            showErrorMessage
            {...register("postalCode")}
          />
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-neutral-900">পেমেন্ট পদ্ধতি</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {paymentOptions.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${
                paymentMethod === opt.value
                  ? "border-emerald-800 bg-emerald-50"
                  : "border-neutral-200"
              }`}
            >
              <input
                type="radio"
                value={opt.value}
                checked={paymentMethod === opt.value}
                onChange={() => setValue("paymentMethod", opt.value)}
                className="sr-only"
              />
              <opt.icon className="size-5 text-emerald-800 shrink-0" />
              <span className="text-sm font-medium text-neutral-800">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || items.length === 0}
        className="w-full bg-emerald-800 hover:bg-emerald-900 text-white"
      >
        অর্ডার করুন
      </Button>
    </form>
  );
}
