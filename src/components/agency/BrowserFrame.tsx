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
      className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/10 ${className ?? ""}`}
    >
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-red-300" />
          <span className="size-2.5 rounded-full bg-amber-300" />
          <span className="size-2.5 rounded-full bg-emerald-300" />
        </div>
        <div className="min-w-0 flex-1 truncate rounded-full border border-slate-200/70 bg-white px-3 py-1 text-center text-[10px] text-slate-400">
          {title}
        </div>
        {badge && <span className="shrink-0">{badge}</span>}
      </div>
      <div className={`relative aspect-16/10 w-full ${imageClassName ?? ""}`}>
        <Image src={src} alt={title} fill className="object-cover object-top" />
      </div>
    </div>
  );
}
