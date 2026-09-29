"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { currentUser, useGadgetDB, useHydrated } from "@/src/lib/gadget-store/store";
import { formatDate } from "@/src/lib/gadget-store/format";
import { cn } from "@/src/lib/utils";
import { accountLinks } from "../GadgetHeader";
import { PageLoader } from "../shared";

export default function AccountShell({ children }: { children: React.ReactNode }) {
  const db = useGadgetDB();
  const hydrated = useHydrated();
  const pathname = usePathname();
  const user = currentUser(db);
  const unread = db.chats.find((t) => t.customerId === db.currentUserId)?.customerUnread ?? 0;
  const links = accountLinks.filter((l) => l.href !== "/gadgets/track-order");

  return (
    <div className="container mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="h-fit min-w-0 rounded-2xl border border-neutral-100 p-4">
        <div className="flex items-center gap-3 border-b border-neutral-100 px-2 pb-4">
          <span className="flex size-12 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-orange-600">
            {hydrated ? user.name[0] : ""}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-neutral-900">{hydrated ? user.name : "…"}</p>
            <p className="text-xs text-neutral-500">{hydrated ? `Member since ${formatDate(user.joinedAt)}` : ""}</p>
          </div>
        </div>
        <nav className="mt-3 flex gap-1 overflow-x-auto lg:flex-col [scrollbar-width:none]">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/gadgets/account" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  active ? "bg-orange-50 font-semibold text-orange-600" : "text-neutral-700 hover:bg-neutral-50"
                )}
              >
                <Icon className="size-4" /> {label}
                {label === "Messages" && hydrated && unread > 0 && (
                  <span className="ml-auto rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">{unread}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0">{hydrated ? children : <PageLoader />}</div>
    </div>
  );
}
