import Link from "next/link";
import { ShoppingBag, Hotel } from "lucide-react";

export default function RootPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-neutral-50 px-4 text-center">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl">
          Choose Your Platform
        </h1>
        <p className="mt-2 text-sm text-neutral-500">Select where you want to go</p>
      </div>

      <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
        <Link
          href="/ecommerce"
          className="group flex flex-col items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-10 shadow-sm transition hover:border-emerald-600 hover:shadow-md"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white">
            <ShoppingBag className="size-7" />
          </span>
          <span className="text-lg font-semibold text-neutral-900">Ecommerce</span>
          <span className="text-sm text-neutral-500">Shop products online</span>
        </Link>

        <Link
          href="/hotel-management"
          className="group flex flex-col items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-10 shadow-sm transition hover:border-sky-600 hover:shadow-md"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-sky-100 text-sky-700 group-hover:bg-sky-600 group-hover:text-white">
            <Hotel className="size-7" />
          </span>
          <span className="text-lg font-semibold text-neutral-900">Hotel &amp; Resort Booking</span>
          <span className="text-sm text-neutral-500">Find and book your stay</span>
        </Link>
      </div>
    </div>
  );
}
