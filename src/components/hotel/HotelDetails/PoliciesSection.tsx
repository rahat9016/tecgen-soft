import { Baby, BadgeCheck, CigaretteOff, Clock3, IdCard, PawPrint, ShieldCheck } from "lucide-react";

const CHECK_TIMES = /^Check-in from (.+?), Check-out until (.+)$/i;

export const parseCheckTimes = (policies: string[]) => {
  for (const policy of policies) {
    const match = policy.match(CHECK_TIMES);
    if (match) return { checkIn: match[1], checkOut: match[2] };
  }
  return null;
};

const policyIcon = (policy: string) => {
  const text = policy.toLowerCase();
  if (text.includes("cancellation")) return BadgeCheck;
  if (text.includes("pet")) return PawPrint;
  if (text.includes("smok")) return CigaretteOff;
  if (text.includes("child")) return Baby;
  if (text.includes(" id")) return IdCard;
  return ShieldCheck;
};

export default function PoliciesSection({ policies }: { policies: string[] }) {
  const times = parseCheckTimes(policies);
  const rules = policies.filter((policy) => !CHECK_TIMES.test(policy));

  return (
    <div className="space-y-4">
      {times && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Check-in", value: `From ${times.checkIn}` },
            { label: "Check-out", value: `Until ${times.checkOut}` },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl bg-sky-50 p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
                <Clock3 className="size-5" />
              </span>
              <div>
                <p className="text-xs font-medium text-sky-700">{label}</p>
                <p className="text-sm font-bold text-neutral-900">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {rules.map((policy) => {
          const Icon = policyIcon(policy);
          return (
            <li key={policy} className="flex items-start gap-2.5 text-sm text-neutral-700">
              <Icon className="mt-0.5 size-4 shrink-0 text-sky-600" />
              {policy}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
