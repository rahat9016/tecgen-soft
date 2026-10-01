"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pencil } from "lucide-react";
import { currentUser, useGadgetDB, useHydrated } from "@/src/lib/gadget-store/store";
import { formatDate } from "@/src/lib/gadget-store/format";
import { cn } from "@/src/lib/utils";
import GadgetAvatar from "../GadgetAvatar";
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
    <div className="container mt-8 grid items-start gap-6 lg:grid-cols-[272px_1fr] lg:gap-8">
      <aside className="min-w-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white lg:sticky lg:top-36">
        <div className="relative">
          <div className="h-20 bg-gradient-to-br from-neutral-900 via-neutral-800 to-orange-600" />
          <div className="-mt-10 flex flex-col items-center px-4 pb-5 text-center">
            <div className="relative">
              {hydrated ? (
                <GadgetAvatar
                  user={user}
                  className="size-20 border-4 border-white bg-orange-100 text-2xl font-bold text-orange-600 shadow-md"
                />
              ) : (
                <span className="block size-20 rounded-full border-4 border-white bg-neutral-100" />
              )}
              <Link
                href="/gadgets/account/profile"
                aria-label="Edit profile"
                className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full border-2 border-white bg-neutral-900 text-white transition hover:bg-orange-500"
              >
                <Pencil className="size-3" />
              </Link>
            </div>
            <p className="mt-3 max-w-full truncate font-semibold text-neutral-900">{hydrated ? user.name : "…"}</p>
            {hydrated && user.email && <p className="max-w-full truncate text-xs text-neutral-500">{user.email}</p>}
            <p className="mt-2 rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] text-neutral-600">
              {hydrated ? `Member since ${formatDate(user.joinedAt)}` : " "}
            </p>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-neutral-100 p-3 lg:flex-col [scrollbar-width:none]">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/gadgets/account" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  active
                    ? "bg-orange-50 font-semibold text-orange-600 lg:before:absolute lg:before:inset-y-2 lg:before:left-0 lg:before:w-1 lg:before:rounded-full lg:before:bg-orange-500"
                    : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
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
