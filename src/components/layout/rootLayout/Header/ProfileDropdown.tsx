"use client";

import { logoutUser } from "@/src/lib/redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/src/lib/redux/hooks";
import { ChevronDown, User } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../ui/dropdown-menu";

export function ProfileDropdown() {
  const dispatch = useAppDispatch();
  const {
    userInformation: { firstName },
  } = useAppSelector((state) => state.auth);
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1 rounded-full border border-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none"
          aria-label="Open profile menu"
        >
          <User size={20} />
          <span className="max-w-28 truncate font-medium">
            {firstName || "Profile"}
          </span>
          <ChevronDown size={18} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="z-9999 min-w-40 rounded-md bg-white shadow-lg"
      >
        <DropdownMenuItem
          onClick={() => router.push("/admin")}
          className="cursor-pointer"
        >
          Admin
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-600 cursor-pointer"
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
