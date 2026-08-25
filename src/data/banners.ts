import {
  Truck,
  HandCoins,
  RefreshCcw,
  ShieldCheck,
  Headset,
  Users,
  Package,
  ThumbsUp,
  CalendarClock,
  Award,
} from "lucide-react";

export const features = [
  { icon: Truck, title: "ফ্রি ডেলিভারি", subtitle: "৳৯৯৯+ অর্ডারে সারা বাংলাদেশে" },
  { icon: HandCoins, title: "ক্যাশ অন ডেলিভারি", subtitle: "পণ্য বুঝে টাকা দিন" },
  { icon: RefreshCcw, title: "সহজ রিটার্ন", subtitle: "৭ দিনের রিটার্ন সুবিধা" },
  { icon: ShieldCheck, title: "নিরাপদ কেনাকাটা", subtitle: "১০০% সিকিউর পেমেন্ট" },
  { icon: Headset, title: "২৪/৭ সাপোর্ট", subtitle: "আমরা আছি আপনার পাশে" },
];

export const stats = [
  { icon: Users, value: "10K+", label: "Happy Customers" },
  { icon: Package, value: "500+", label: "Premium Products" },
  { icon: ThumbsUp, value: "99%", label: "Positive Reviews" },
  { icon: CalendarClock, value: "7 Days", label: "Easy Returns" },
  { icon: Truck, value: "Fast", label: "Delivery" },
  { icon: Award, value: "Best", label: "Price Guarantee" },
];

export const promoBanners = [
  {
    tone: "dark" as const,
    title: "ব্যাংক অফার",
    subtitle: "কার্ড পেমেন্টে",
    highlight: "20% ইনস্ট্যান্ট ছাড়!",
    note: "নির্বাচিত ব্যাংক কার্ডে",
    cta: "বিস্তারিত দেখুন",
  },
  {
    tone: "cream" as const,
    title: "উইকেন্ড স্পেশাল",
    subtitle: "অতিরিক্ত",
    highlight: "10% ছাড়!",
    note: "৳২,৫০০+ অর্ডারে",
    cta: "এখনই শপ করুন",
    code: "WEEKEND10",
  },
  {
    tone: "blue" as const,
    title: "নতুন ইউজার অফার",
    subtitle: "প্রথম অর্ডারে",
    highlight: "ফ্ল্যাট 15% ছাড়!",
    note: "কুপন কোড: HELLO15",
    cta: "এখনই শপ করুন",
  },
];
