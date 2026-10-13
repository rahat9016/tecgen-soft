"use client";

import Link from "next/link";
import { Bell, ChevronDown, ClipboardList, LogIn, LogOut, UserPlus, UserRound } from "lucide-react";
import { toast } from "react-toastify";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { initials } from "@/src/lib/hotel-store/format";
import { logOut, useCurrentGuest, useHotelDB } from "@/src/lib/hotel-store/store";

export default function HotelProfileMenu({ onDark = false }: { onDark?: boolean }) {
  const db = useHotelDB();
  const user = useCurrentGuest();
  const unread = user ? db.notices.filter((n) => n.to === user.id && !n.read).length : 0;
  const firstName = user?.name.split(" ")[0];

  const avatar = (size: string) => (
    <Avatar className={`${size} ring-2 ring-white shadow-md`}>
      <AvatarFallback className="bg-gradient-to-br from-sky-500 to-sky-700 text-sm font-semibold text-white">
        {user ? initials(user.name) : <UserRound className="size-4" />}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={unread ? `Open profile menu, ${unread} unread notifications` : "Open profile menu"}
          className={`flex items-center gap-2 rounded-full border p-1 pr-2.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
            onDark ? "border-white/30 bg-white/10 hover:bg-white/20" : "border-neutral-900/10 bg-white/60 hover:bg-white/80"
          }`}
        >
          <span className="relative">
            {avatar("size-9")}
            {unread > 0 ? (
              <span className="absolute -right-1 -top-1 flex min-w-4.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-4.5 text-white ring-2 ring-white">
                {unread}
              </span>
            ) : (
              user && <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
          </span>
          <span className={`hidden max-w-28 truncate text-sm font-semibold sm:block ${onDark ? "text-white" : "text-neutral-800"}`}>
            {firstName ?? "Log in"}
          </span>
          <ChevronDown className={`size-4 ${onDark ? "text-white/70" : "text-neutral-500"}`} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="w-64 rounded-2xl border-white/60 bg-white/85 p-2 shadow-xl shadow-neutral-900/10 backdrop-blur-xl"
      >
        <div className="flex items-center gap-3 px-2 py-2">
          {avatar("size-11")}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-neutral-900">{user?.name ?? "Guest"}</p>
            <p className="truncate text-xs text-neutral-500">{user?.email ?? "Not signed in"}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
          <Link href="/hotel-management/my-bookings">
            <ClipboardList /> My Bookings
          </Link>
        </DropdownMenuItem>
        {user && (
          <>
            <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
              <Link href="/hotel-management/account#notifications">
                <Bell /> Notifications
                {unread > 0 && <span className="ml-auto rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">{unread}</span>}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
              <Link href="/hotel-management/account">
                <UserRound /> My Account
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        {user ? (
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              logOut("guest");
              toast.info("You're logged out");
            }}
            className="cursor-pointer rounded-lg"
          >
            <LogOut /> Log out
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
              <Link href="/hotel-management/login">
                <LogIn /> Log in
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
              <Link href="/hotel-management/signup">
                <UserPlus /> Create an account
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
