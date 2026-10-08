import { BedDouble, Check, MailCheck, UserRound } from "lucide-react";

const steps = [
  { title: "Choose room", detail: "Room & dates", icon: BedDouble },
  { title: "Guest details", detail: "Contact & payment", icon: UserRound },
  { title: "Confirmation", detail: "Instant e-mail receipt", icon: MailCheck },
];

/** Booking progress. `current` is the zero-based active step; pass steps.length to show every step done. */
export default function BookingSteps({ current }: { current: number }) {
  const finished = current >= steps.length;
  const active = steps[Math.min(current, steps.length - 1)];

  return (
    <nav aria-label="Booking progress" className="w-full rounded-3xl border border-neutral-200/80 bg-white p-4 shadow-sm md:px-6 md:py-5">
      {/* Phones: one line of text plus a segmented bar. */}
      <div className="md:hidden">
        <div className="flex items-center justify-between text-sm">
          <p className="font-semibold text-neutral-900">
            {finished ? "Booking complete" : active.title}
          </p>
          <p className="text-xs font-medium text-neutral-500">
            Step {Math.min(current + 1, steps.length)} of {steps.length}
          </p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {steps.map((step, i) => (
            <span
              key={step.title}
              className={`h-1.5 rounded-full ${
                i < current || finished ? "bg-emerald-500" : i === current ? "bg-sky-600" : "bg-neutral-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Tablet & desktop: icons, titles and a progress line between steps. */}
      <ol className="hidden items-center md:flex">
        {steps.map((step, i) => {
          const done = i < current;
          const isCurrent = i === current;
          const Icon = step.icon;
          return (
            <li
              key={step.title}
              aria-current={isCurrent ? "step" : undefined}
              className={`flex items-center ${i < steps.length - 1 ? "flex-1" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`relative flex size-11 shrink-0 items-center justify-center rounded-2xl transition ${
                    done
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                      : isCurrent
                        ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30 ring-4 ring-sky-100"
                        : "bg-neutral-100 text-neutral-400"
                  }`}
                >
                  {done ? <Check className="size-5" strokeWidth={3} /> : <Icon className="size-5" />}
                </span>
                <div className="whitespace-nowrap">
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-wider ${
                      done ? "text-emerald-600" : isCurrent ? "text-sky-600" : "text-neutral-400"
                    }`}
                  >
                    {done ? "Done" : `Step ${i + 1}`}
                  </p>
                  <p className={`text-sm font-bold ${done || isCurrent ? "text-neutral-900" : "text-neutral-400"}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-neutral-500">{step.detail}</p>
                </div>
              </div>

              {i < steps.length - 1 && (
                <span className="relative mx-4 h-1.5 min-w-10 flex-1 overflow-hidden rounded-full bg-neutral-100 lg:mx-6">
                  <span
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                      done ? "w-full bg-emerald-500" : isCurrent ? "w-1/2 bg-sky-500" : "w-0"
                    }`}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
