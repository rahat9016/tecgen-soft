"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, PackageCheck } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export default function OrderSuccess() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "—";

  return (
    <div className="container flex flex-col items-center py-16 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <CheckCircle2 className="size-10" />
      </span>

      <h1 className="mt-6 text-2xl font-bold text-neutral-900">
        ধন্যবাদ! আপনার অর্ডার সফল হয়েছে
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        অর্ডার আইডি: <span className="font-semibold text-neutral-800">{orderId}</span>
      </p>

      <div className="mt-8 flex w-full max-w-md items-center gap-4 rounded-xl border border-neutral-100 bg-neutral-50 p-6 text-left">
        <PackageCheck className="size-8 shrink-0 text-emerald-800" />
        <div>
          <p className="text-sm font-semibold text-neutral-800">
            আপনার অর্ডার প্রসেসিং হচ্ছে
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            আনুমানিক ডেলিভারি সময়: ২-৪ কার্যদিবস। ডেলিভারির সময় ক্যাশ অন
            ডেলিভারি বা আপনার নির্বাচিত পেমেন্ট পদ্ধতিতে পেমেন্ট করুন।
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Button asChild className="bg-emerald-800 hover:bg-emerald-900 text-white">
          <Link href="/ecommerce">শপিং চালিয়ে যান</Link>
        </Button>
      </div>
    </div>
  );
}
