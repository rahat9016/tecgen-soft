import { ShieldCheck } from "lucide-react";

export default function PoliciesSection({ policies }: { policies: string[] }) {
  return (
    <ul className="space-y-2">
      {policies.map((policy) => (
        <li key={policy} className="flex items-start gap-2 text-sm text-neutral-700">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sky-600" />
          {policy}
        </li>
      ))}
    </ul>
  );
}
