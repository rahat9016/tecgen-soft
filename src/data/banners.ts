import { Truck, Users, Package, ThumbsUp, CalendarClock, Award } from "lucide-react";

export const features = [
  { icon: "payment" as const, title: "Easy Payment" },
  { icon: "delivery" as const, title: "Nationwide Delivery" },
  { icon: "return" as const, title: "Free & Easy Returns" },
  { icon: "price" as const, title: "Best Price Guaranteed" },
  { icon: "authentic" as const, title: "100% Authentic Products" },
  { icon: "secure" as const, title: "Secure Payment" },
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
    title: "Bank Offer",
    subtitle: "On Card Payments",
    highlight: "20% Instant Discount!",
    note: "On selected bank cards",
    cta: "See Details",
    icon: "card" as const,
  },
  {
    tone: "cream" as const,
    title: "Weekend Special",
    subtitle: "Extra",
    highlight: "10% Off!",
    note: "On orders of ৳2,500+",
    cta: "Shop Now",
    code: "WEEKEND10",
    icon: "gift" as const,
  },
  {
    tone: "blue" as const,
    title: "New User Offer",
    subtitle: "On First Order",
    highlight: "Flat 15% Off!",
    note: "Coupon Code: HELLO15",
    cta: "Shop Now",
    icon: "bag" as const,
  },
];
