import Link from "next/link";

export default function GadgetLogo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/gadgets" className="flex shrink-0 flex-col leading-none">
      <span className={`text-2xl font-extrabold tracking-tight ${light ? "text-white" : "text-neutral-900"}`}>
        gadget<span className="text-orange-500">hub</span>
      </span>
      <span className={`mt-0.5 text-[10px] font-medium tracking-[0.2em] ${light ? "text-neutral-400" : "text-neutral-500"}`}>
        SMART TECH STORE
      </span>
    </Link>
  );
}
