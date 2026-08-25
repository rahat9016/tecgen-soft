"use client";

import { logoutUser } from "@/src/lib/redux/features/auth/authSlice";
import { useAppDispatch } from "@/src/lib/redux/hooks";
import { cn } from "@/src/lib/utils";
import { getMenuItems } from "@/src/utils/getMenuItems";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";
import { Button } from "../../ui/button";

interface SidebarProps {
  className?: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export default function Sidebar({
  className,
  isOpen,
  setIsOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const menuItems = getMenuItems();

  const currentPath = pathname;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-70 bg-white border-r border-skeleton flex flex-col px-4 sm:px-5 transition-transform duration-300 ease-in-out z-50",
          {
            "-translate-x-full": !isOpen,
            "translate-x-0": isOpen,
            "lg:translate-x-0 lg:static": true,
          },
          className
        )}
      >
        <div
          onClick={() => router.push("/")}
          className="flex flex-row items-center cursor-pointer gap-1 h-18"
        >
          <Image
            width={216}
            height={216}
            src="/logo.png"
            alt="logo"
            className="w-13"
          />
          <div>
            <h3 className="text-base text-secondary-dark font-semibold">
              Happy Hospital & <br /> Diagnostic Center
            </h3>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar mt-4">
          <Accordion
            type="multiple"
            className="flex flex-col h-full gap-1 w-full"
          >
            <div className="overflow-y-auto custom-scrollbar flex-1 py-1">
              {menuItems.map((item) => {
                const isActiveParent = item.href && currentPath === item.href;

                const isActiveChild = item.children?.some(
                  (child) => currentPath === child.href
                );

                const isActive = isActiveParent || isActiveChild;

                return (
                  <AccordionItem
                    key={item.label}
                    value={item.label}
                    className="border-b-0"
                  >
                    {item.children ? (
                      <>
                        <AccordionTrigger
                          className={`px-3 sm:px-4 h-10 sm:h-11.5 flex items-center font-inter leading-none hover:no-underline text-sm sm:text-base ${
                            isActive
                              ? "bg-secondary text-white"
                              : "text-[#8C8C8C] hover:bg-[#EAF6FB] hover:text-primary"
                          }`}
                        >
                          <div className="flex items-center w-full">
                            <Image
                              src={item.icon}
                              alt=""
                              width={24}
                              height={24}
                              className={`${isActive ? "brightness-0 invert" : ""}`}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent
                          className={`flex flex-col w-full mt-1 ${
                            isActiveChild ? "block" : ""
                          }`}
                        >
                          {item.children.map((child) => {
                            const isChildActive = currentPath === child.href;

                            return (
                              <Link
                                key={child.label}
                                href={child.href}
                                onClick={() => setIsOpen(false)}
                                className={`w-full h-10 sm:h-11.5 flex items-center gap-2 px-3 sm:px-4 text-xs sm:text-sm rounded-md font-inter pl-10 ${
                                  isChildActive
                                    ? "bg-primary text-white"
                                    : "text-[#8C8C8C] hover:bg-[#EAF6FB] hover:text-primary"
                                }`}
                              >
                                <span className="truncate">{child.label}</span>
                              </Link>
                            );
                          })}
                        </AccordionContent>
                      </>
                    ) : (
                      <Link
                        href={item.href ?? "#"}
                        onClick={() => setIsOpen(false)}
                        className={`w-full  h-10 sm:h-12 flex items-center gap-2.5 px-3 text-sm lg:text-base rounded-sm ${
                          isActive
                            ? "bg-secondary text-white font-medium"
                            : "text-secondary-dark font-normal"
                        }`}
                      >
                        <Image
                          src={item.icon}
                          alt=""
                          width={24}
                          height={24}
                          className={`${isActive ? "brightness-0 invert" : ""}`}
                        />
                        <h3>{item.label}</h3>
                      </Link>
                    )}
                  </AccordionItem>
                );
              })}
            </div>
          </Accordion>
        </nav>
        <div className="pb-2 mt-4">
          <Button
            onClick={() => {
              dispatch(logoutUser());
              setIsOpen(false);
            }}
            className="w-full bg-[#fde2e2] hover:bg-[#FDECEC] text-[#A8A8A8] hover:text-[#EB5757] flex items-center justify-start gap-2 h-10 sm:h-12 px-3! sm:px-4! text-sm sm:text-base"
          >
            <LogOut className="h-4 w-4 sm:h-6 sm:w-6" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
}
