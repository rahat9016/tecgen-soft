import Appointment from "@/public/icons/Appointment.svg";
import dashboard from "@/public/icons/dashboard.svg";
import Doctors from "@/public/icons/Doctors.svg";
import HealthPackages from "@/public/icons/HealthPackages.svg";
import Specialties from "@/public/icons/Specialities.svg";

import Blogs from "@/public/icons/Blogs.svg";
import Career from "@/public/icons/Career.svg";
import ContactSupport from "@/public/icons/ContactSupport.svg";
import Membership from "@/public/icons/Membership.svg";

import Corporate from "@/public/icons/Corporate.svg";
import HeroManagement from "@/public/icons/HeroManagement.svg";
import Media from "@/public/icons/Media.svg";

import { StaticImageData } from "next/image";
export interface MenuItem {
  label: string;
  icon: StaticImageData;
  href?: string;
  children?: { label: string; href: string }[];
}
export function getMenuItems(): MenuItem[] {
  const menuItems: (MenuItem | false)[] = [
    { label: "Dashboard", icon: dashboard, href: "/admin" },
    {
      label: "Appointment",
      icon: Appointment,
      href: "/admin/all-appointments",
    },
    { label: "Doctors", icon: Doctors, href: "/admin/doctors" },
    {
      label: "Health Packages",
      icon: HealthPackages,
      href: "/admin/health-packages",
    },
    { label: "Specialties", icon: Specialties, href: "/admin/specialties" },
    {
      label: "Membership",
      icon: Membership,
      href: "/admin/general-membership",
    },
    { label: "Blogs", icon: Blogs, href: "/admin/blogs" },
    { label: "Career", icon: Career, href: "/admin/applicant-list" },
    {
      label: "Contact & Support",
      icon: ContactSupport,
      href: "/admin/contact-support-list",
    },
    // {
    //   label: "User Management",
    //   icon: UserManagement,
    //   href: "/admin/user-management",
    // },
    {
      label: "Hero Management",
      icon: HeroManagement,
      href: "/admin/hero-management",
    },
    { label: "Media", icon: Media, href: "/admin/image-gallery" },
    { label: "Corporate", icon: Corporate, href: "/admin/corporate" },

    // {
    //   label: "Events",
    //   icon: CalendarDays,
    //   // children: hasPermission
    //   //   ? [
    //   //       { label: "Event List", href: "/admin/events/events-list" },
    //   //       {
    //   //         label: "Events Categories",
    //   //         href: "/admin/events/events-categories",
    //   //       },
    //   //       { label: "Events Tags", href: "/admin/events/events-tags" },
    //   //     ]
    //   //   : [{ label: "Event List", href: "/admin/events/events-list" }],
    // },
  ];

  return menuItems.filter(Boolean) as MenuItem[];
}
