import Image from "next/image";
import type { ReactNode } from "react";

export default function BrowserFrame({
  title,
  src,
  badge,
  className,
  imageClassName,
}: {
  title: string;
  src: string;
  badge?: ReactNode;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 ${className ?? ""}`}
    >
      <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-3 py-2">
        <span className="size-2 rounded-full bg-red-300" />
        <span className="size-2 rounded-full bg-amber-300" />
        <span className="size-2 rounded-full bg-emerald-300" />
        <span className="ml-2 min-w-0 flex-1 truncate text-[10px] text-slate-400">{title}</span>
        {badge && <span className="ml-auto shrink-0">{badge}</span>}
      </div>
      <div className={`relative aspect-16/10 w-full ${imageClassName ?? ""}`}>
        <Image src={src} alt={title} fill className="object-cover object-top" />
      </div>
    </div>
  );
}
