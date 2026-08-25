"use client";
import appointment from "@/public/icons/appointment.svg";
import file from "@/public/icons/File.svg";
import hotline from "@/public/icons/Hotline.svg";
import ins from "@/public/icons/ins.svg";
import wp from "@/public/icons/wp.svg";
import { reportURL } from "@/src/config/envConfig";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";

const socials = [
  { name: "Whatsapp", href: "https://wa.me/8801717173311", icon: wp },
  // { name: "Hotline", href: "tel:16254", icon: hotline },
  { name: "Instagram", href: "", icon: ins },
  {
    name: "Doctor Appointment",
    href: "/doctor-appointment",
    icon: appointment,
  },
  { name: "Online Report", href: reportURL, icon: file },
  { name: "16254", href: "tel:16254", icon: hotline },
];

export default function SocialMedia() {
  const visibleSocials = socials.filter(
    (item) => item.href && item.href !== "#"
  );
  return (
    <div className="fixed right-6 top-[60%] -translate-y-1/2 flex flex-col gap-3 z-50">
      {visibleSocials.map((item, index) => {
        return (
          <TooltipProvider key={`${item.name}-${index}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                  aria-label={item.name}
                  className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center
             border hover:bg-primary transition group"
                >
                  <Image
                    src={item.icon}
                    alt={item.name}
                    width={18}
                    height={18}
                    className="transition-all duration-300 group-hover:brightness-0 group-hover:invert"
                  />
                </a>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-primary mr-1">
                {item.name}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}
