import { Check } from "lucide-react";

const steps = ["Choose room", "Guest details", "Confirmation"];

/** Booking progress. `current` is the zero-based active step; pass steps.length to show all done. */
export default function BookingSteps({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2 text-xs font-medium sm:gap-3 sm:text-sm">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={step} className="flex items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-2">
              <span
                className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                      ? "bg-sky-600 text-white ring-4 ring-sky-100"
                      : "bg-neutral-100 text-neutral-400"
                }`}
              >
                {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
              </span>
              <span className={active || done ? "font-semibold text-neutral-900" : "text-neutral-500"}>{step}</span>
            </span>
            {i < steps.length - 1 && (
              <span className={`h-px w-6 sm:w-12 ${done ? "bg-emerald-300" : "bg-neutral-200"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
