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
  image: string;
}

export const categories: Category[] = [
  {
    name: "মোবাইল ও এক্সেসরিজ",
    icon: Smartphone,
    image: "https://loremflickr.com/300/300/smartphone?lock=101",
  },
  {
    name: "ইলেকট্রনিক্স",
    icon: Headphones,
    image: "https://loremflickr.com/300/300/headphones?lock=102",
  },
  {
    name: "ফ্যাশন",
    icon: Shirt,
    image: "https://loremflickr.com/300/300/jacket?lock=103",
  },
  {
    name: "হোম ও কিচেন",
    icon: CookingPot,
    image: "https://loremflickr.com/300/300/cookware?lock=104",
  },
  {
    name: "বিউটি ও হেলথ",
    icon: Sparkles,
    image: "https://loremflickr.com/300/300/cosmetics?lock=105",
  },
  {
    name: "স্পোর্টস",
    icon: Trophy,
    image: "https://loremflickr.com/300/300/football?lock=106",
  },
  {
    name: "বই ও স্টেশনারি",
    icon: BookOpen,
    image: "https://loremflickr.com/300/300/books?lock=107",
  },
  {
    name: "টয়েজ ও গেমস",
    icon: Gamepad2,
    image: "https://loremflickr.com/300/300/teddybear?lock=108",
  },
];
