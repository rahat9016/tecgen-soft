import {
  Smartphone,
  Headphones,
  Shirt,
  CookingPot,
  Sparkles,
  Trophy,
  BookOpen,
  Gamepad2,
  type LucideIcon,
} from "lucide-react";

export interface Category {
  name: string;
  icon: LucideIcon;
}

export const categories: Category[] = [
  { name: "মোবাইল ও এক্সেসরিজ", icon: Smartphone },
  { name: "ইলেকট্রনিক্স", icon: Headphones },
  { name: "ফ্যাশন", icon: Shirt },
  { name: "হোম ও কিচেন", icon: CookingPot },
  { name: "বিউটি ও হেলথ", icon: Sparkles },
  { name: "স্পোর্টস", icon: Trophy },
  { name: "বই ও স্টেশনারি", icon: BookOpen },
  { name: "টয়েজ ও গেমস", icon: Gamepad2 },
];
