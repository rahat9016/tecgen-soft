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
    image: "https://live.staticflickr.com/4102/4764971368_7a28927542_b.jpg",
  },
  {
    name: "ইলেকট্রনিক্স",
    icon: Headphones,
    image: "https://live.staticflickr.com/5171/5579224313_f5f1a83839.jpg",
  },
  {
    name: "ফ্যাশন",
    icon: Shirt,
    image:
      "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvbnMxNTM5Mi1pbWFnZS1rd3lyemU2NS5qcGc.jpg",
  },
  {
    name: "হোম ও কিচেন",
    icon: CookingPot,
    image: "https://live.staticflickr.com/4717/26128230038_cb2348c77b_b.jpg",
  },
  {
    name: "বিউটি ও হেলথ",
    icon: Sparkles,
    image: "https://live.staticflickr.com/7156/6498240819_88be80a124_b.jpg",
  },
  {
    name: "স্পোর্টস",
    icon: Trophy,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/6/6e/Football_%28soccer_ball%29.svg",
  },
  {
    name: "বই ও স্টেশনারি",
    icon: BookOpen,
    image: "https://live.staticflickr.com/8364/8395557514_a415403a3c_b.jpg",
  },
  {
    name: "টয়েজ ও গেমস",
    icon: Gamepad2,
    image: "https://live.staticflickr.com/6019/6327676702_2f7dd23130_b.jpg",
  },
];
