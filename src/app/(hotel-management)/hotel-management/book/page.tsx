import { Check } from "lucide-react";
import GuestInfoForm from "@/src/components/hotel/Booking/GuestInfoForm";

const steps = ["Choose room", "Guest details", "Confirmation"];
const currentStep = 1;

export default function HotelBookingPage() {
  return (
    <div className="container py-8">
      <ol className="flex items-center gap-2 text-xs font-medium sm:gap-3 sm:text-sm">
        {steps.map((step, i) => {
          const done = i < currentStep;
          const current = i === currentStep;
          return (
            <li key={step} className="flex items-center gap-2 sm:gap-3">
              <span className="flex items-center gap-2">
                <span
                  className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                    done
                      ? "bg-emerald-500 text-white"
                      : current
                        ? "bg-sky-600 text-white ring-4 ring-sky-100"
                        : "bg-neutral-100 text-neutral-400"
                  }`}
                >
                  {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                </span>
                <span className={current ? "font-semibold text-neutral-900" : "text-neutral-500"}>{step}</span>
              </span>
              {i < steps.length - 1 && (
                <span className={`h-px w-6 sm:w-12 ${done ? "bg-emerald-300" : "bg-neutral-200"}`} />
              )}
            </li>
          );
        })}
      </ol>

      <h1 className="mt-6 text-2xl font-bold text-neutral-900 md:text-3xl">Complete your booking</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Just a few details and your room is reserved. Guests from Bangladesh and abroad are welcome.
      </p>

      <div className="mt-6">
        <GuestInfoForm />
      </div>
    </div>
  );
}
