"use client";

import Link from "next/link";
import { ChevronDown, ClipboardList, LogIn, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { logoutUser } from "@/src/lib/redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/src/lib/redux/hooks";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&q=80&auto=format&fit=crop&crop=faces";

export default function HotelProfileMenu({ onDark = false }: { onDark?: boolean }) {
  const dispatch = useAppDispatch();
  const { id, firstName, lastName, email, profilePicture } = useAppSelector(
    (state) => state.auth.userInformation
  );

  const isLoggedIn = Boolean(id);
  const fullName = isLoggedIn
    ? [firstName, lastName].filter(Boolean).join(" ") || "My Account"
    : "Guest";
  const initials =
    [firstName, lastName]
      .filter(Boolean)
      .map((name) => name[0])
      .join("")
      .toUpperCase() || "G";

  const avatar = (size: string) => (
    <Avatar className={`${size} ring-2 ring-white shadow-md`}>
      <AvatarImage
        src={(isLoggedIn && profilePicture) || DEFAULT_AVATAR}
        alt={fullName}
        className="object-cover"
      />
      <AvatarFallback className="bg-gradient-to-br from-sky-500 to-sky-700 text-sm font-semibold text-white">
        {initials}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open profile menu"
          className={`flex items-center gap-2 rounded-full border p-1 pr-2.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
            onDark
              ? "border-white/30 bg-white/10 hover:bg-white/20"
              : "border-neutral-900/10 bg-white/60 hover:bg-white/80"
          }`}
        >
          <span className="relative">
            {avatar("size-9")}
            {isLoggedIn && (
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
          </span>
          <span
            className={`hidden max-w-28 truncate text-sm font-semibold sm:block ${
              onDark ? "text-white" : "text-neutral-800"
            }`}
          >
            {isLoggedIn ? firstName || "Account" : "Guest"}
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
            <p className="truncate text-sm font-semibold text-neutral-900">{fullName}</p>
            <p className="truncate text-xs text-neutral-500">
              {isLoggedIn ? email : "Not signed in"}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
          <Link href="/hotel-management/my-bookings">
            <ClipboardList /> My Bookings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isLoggedIn ? (
          <DropdownMenuItem
            variant="destructive"
            onClick={() => dispatch(logoutUser())}
            className="cursor-pointer rounded-lg"
          >
            <LogOut /> Logout
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
            <Link href="/auth/login">
              <LogIn /> Log in / Sign up
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
