import {
  BedDouble,
  CalendarCheck,
  CalendarClock,
  Camera,
  CircleCheck,
  CreditCard,
  Globe,
  GraduationCap,
  Headset,
  Images,
  LayoutDashboard,
  Link2,
  MapPin,
  Megaphone,
  PackageSearch,
  Palette,
  Phone,
  Puzzle,
  Receipt,
  RefreshCw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Tags,
  Type,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type ScopeItem = { icon: LucideIcon; title: string; desc?: string };

/** a rule without a title keeps the package's own wording as the title */
type Rule = { match: RegExp; item: Omit<ScopeItem, "title"> & { title?: string } };

/**
 * Plain-language version of a package's included / not-included lines, for owners who aren't technical.
 * Matched by keyword so the same rule covers small wording differences between packages.
 */
const rules: Rule[] = [
  // included
  { match: /responsive/i, item: { icon: Smartphone, title: "Mobile-friendly website", desc: "Phone, tablet ও computer — সব জায়গায় সুন্দর দেখাবে।" } },
  { match: /admin dashboard/i, item: { icon: LayoutDashboard, title: "নিজের control panel", desc: "Order, booking, দাম ও ছবি — নিজেই বদলাতে পারবেন।" } },
  { match: /room management/i, item: { icon: BedDouble, title: "Room management", desc: "Room-এর ধরন, দাম ও খালি আছে কি না — নিজেই ঠিক করুন।" } },
  { match: /booking ও availability/i, item: { icon: CalendarCheck, title: "Online booking", desc: "Guest নিজেই খালি room দেখে booking দিতে পারবে।" } },
  { match: /pre-order/i, item: { icon: PackageSearch, title: "Pre-order ও order tracking", desc: "আগাম order নিন; customer নিজেই দেখবে order কোথায় আছে।" } },
  { match: /cash memo/i, item: { icon: Receipt, title: "Cash memo ও হিসাব", desc: "দোকানের বিক্রির memo আর দিন-মাসের আয়ের হিসাব।" } },
  { match: /product ও category/i, item: { icon: Tags, title: "Product সাজানো", desc: "Product যোগ করা, দাম বদলানো ও category বানানো।" } },
  { match: /order management/i, item: { icon: ShoppingBag, title: "Order management", desc: "নতুন order দেখা ও delivery-র অবস্থা update করা।" } },
  { match: /live slot/i, item: { icon: CalendarClock, title: "Live slot booking", desc: "কোন সময় খালি — player সাথে সাথে দেখে booking দেবে।" } },
  { match: /advance payment/i, item: { icon: Wallet, title: "Advance payment", desc: "Player bKash/Nagad-এ আগেই টাকা দিয়ে slot নিশ্চিত করবে।" } },
  { match: /hosting/i, item: { icon: ShieldCheck, title: "Hosting ও SSL", desc: "Website ২৪ ঘণ্টা online থাকবে, connection নিরাপদ থাকবে।" } },
  { match: /updates|bug/i, item: { icon: RefreshCw, title: "Updates ও সমস্যা ঠিক করা", desc: "কিছু কাজ না করলে আমরা ঠিক করে দেব, নতুন update দেব।" } },
  { match: /support/i, item: { icon: Headset, title: "সবসময় support", desc: "প্রশ্ন বা সমস্যা হলে phone/WhatsApp-এ আমাদের পাবেন।" } },
  { match: /^domain setup/i, item: { icon: Globe, title: "Domain setup", desc: "আপনার website-এর ঠিকানা (যেমন yourshop.com) চালু করে দেব।" } },
  { match: /training/i, item: { icon: GraduationCap, title: "চালানো শেখানো", desc: "কীভাবে ব্যবহার করবেন — আমরা দেখিয়ে দেব।" } },

  // what the customer sends us
  { match: /^domain \(/i, item: { icon: Globe, desc: "Website-এর ঠিকানা — না থাকলে কিনতে সাহায্য করব।" } },
  { match: / name$/i, item: { icon: Type, desc: "Website-এ যে নাম দেখাবে।" } },
  { match: /^logo$/i, item: { icon: Palette, title: "Logo", desc: "আপনার brand-এর logo — PNG বা JPG হলেই হবে।" } },
  { match: /তথ্য ও ছবি|ছবি ও price/i, item: { icon: Images, desc: "নাম, দাম, বিবরণ ও ছবি — যা website-এ দেখাবেন।" } },
  { match: /contact তথ্য/i, item: { icon: Phone, desc: "Phone, WhatsApp ও email — customer যোগাযোগ করবে।" } },
  { match: /^address$/i, item: { icon: MapPin, title: "ঠিকানা", desc: "Map ও contact page-এ দেখানোর জন্য।" } },
  { match: /social/i, item: { icon: Share2, title: "Social links", desc: "Facebook, Instagram page-এর link।" } },

  // what we handle
  { match: /setup ও customization/i, item: { icon: Palette, title: "Setup ও সাজানো", desc: "আপনার logo, রং ও তথ্য দিয়ে website সাজিয়ে দেব।" } },
  { match: /domain connect/i, item: { icon: Link2, title: "Domain connect", desc: "আপনার domain website-এর সাথে যুক্ত করে দেব।" } },

  // not included
  { match: /domain কেনা/i, item: { icon: Globe, title: "Domain কেনার খরচ", desc: "Website-এর ঠিকানা আপনার নামে কিনতে হবে, প্রতি বছর renew করতে হয়।" } },
  { match: /gateway/i, item: { icon: CreditCard, title: "Online payment-এর charge", desc: "bKash, Nagad বা card-এ টাকা নিলে তারা প্রতি লেনদেনে সামান্য charge কাটে।" } },
  { match: /advertising/i, item: { icon: Megaphone, title: "Facebook/Google বিজ্ঞাপন", desc: "বিজ্ঞাপন চালানোর খরচ আলাদা।" } },
  { match: /photography/i, item: { icon: Camera, title: "ছবি তোলা", desc: "Website-এ দেওয়ার ছবি আপনাকে দিতে হবে।" } },
  { match: /custom features/i, item: { icon: Puzzle, title: "নতুন বিশেষ feature", desc: "Package-এ নেই এমন কিছু চাইলে আলাদা খরচ — কাজের আগেই জানিয়ে দেব।" } },
];

export function describeScopeItem(line: string): ScopeItem {
  const item = rules.find((r) => r.match.test(line))?.item;
  return item ? { ...item, title: item.title ?? line } : { icon: CircleCheck, title: line };
}
