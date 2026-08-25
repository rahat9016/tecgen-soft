"use client";

import { useAppSelector } from "@/src/lib/redux/hooks";
import { Menu, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import UserSkeleton from "./Skeleton/UserSkeleton";

export default function DashboardHeader({
  toggleSidebar,
}: {
  toggleSidebar?: () => void;
}) {
  const {
    userInformation: { firstName, role, profilePicture },
    loading,
  } = useAppSelector((state) => state.auth);
  return (
    <div
      className={`h-18 bg-white  flex items-center px-3 md:px-6 border-b border-skeleton gap-3 md:gap-5 justify-between`}
    >
      <div className="flex items-center gap-4">
        {toggleSidebar && (
          <button
            className="lg:hidden p-1 md:p-2 rounded-md hover:bg-gray-100"
            onClick={toggleSidebar}
          >
            <Menu className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        {loading ? (
          <UserSkeleton />
        ) : (
          <div className="flex items-center gap-2 md:gap-4">
            <Avatar className="w-8 h-8 md:w-12 md:h-12">
              {profilePicture ? (
                <AvatarImage src={profilePicture} alt="Profile" />
              ) : (
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="Default Profile"
                />
              )}
              <AvatarFallback>
                <User />
              </AvatarFallback>
            </Avatar>

            <div className="hidden sm:block">
              <h2 className="text-primary font-semibold font-inter text-sm md:text-base truncate">
                Hello, {firstName}
              </h2>
              <p className="text-[#8C8C8C] text-xs md:text-sm font-inter font-normal truncate">
                {role}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
