import { Building2, Trees, Waves, Mountain, Landmark, Home, Warehouse, BedDouble } from "lucide-react";

// `bg` is the resting icon tile; `hover` fills it with the solid colour when the card is hovered.
export const propertyTypes = [
  {
    label: "Budget Hotels",
    description: "Clean, comfy stays that are easy on the wallet",
    icon: Building2,
    bg: "bg-emerald-100 text-emerald-700",
    hover: "group-hover:bg-emerald-600 group-hover:text-white",
  },
  {
    label: "Eco Resorts",
    description: "Green getaways close to nature",
    icon: Trees,
    bg: "bg-green-100 text-green-700",
    hover: "group-hover:bg-green-600 group-hover:text-white",
  },
  {
    label: "Beach Resorts",
    description: "Wake up to sea views and sandy shores",
    icon: Waves,
    bg: "bg-sky-100 text-sky-700",
    hover: "group-hover:bg-sky-600 group-hover:text-white",
  },
  {
    label: "Mountain Resorts",
    description: "Cool air, hill views and quiet mornings",
    icon: Mountain,
    bg: "bg-indigo-100 text-indigo-700",
    hover: "group-hover:bg-indigo-600 group-hover:text-white",
  },
  {
    label: "Luxury Hotels",
    description: "Premium rooms and five-star service",
    icon: Landmark,
    bg: "bg-amber-100 text-amber-700",
    hover: "group-hover:bg-amber-500 group-hover:text-white",
  },
  {
    label: "Cottages",
    description: "Cosy, private stays for small groups",
    icon: Home,
    bg: "bg-orange-100 text-orange-700",
    hover: "group-hover:bg-orange-500 group-hover:text-white",
  },
  {
    label: "Villas",
    description: "Spacious homes with room to spread out",
    icon: Warehouse,
    bg: "bg-violet-100 text-violet-700",
    hover: "group-hover:bg-violet-600 group-hover:text-white",
  },
  {
    label: "Homestays",
    description: "Live like a local with friendly hosts",
    icon: BedDouble,
    bg: "bg-rose-100 text-rose-700",
    hover: "group-hover:bg-rose-600 group-hover:text-white",
  },
];

export const destinations = [
  {
    name: "Cox's Bazar",
    tagline: "World's longest sea beach",
    properties: "450+ Properties",
    image:
      "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=600&h=800&q=80&auto=format&fit=crop",
  },
  {
    name: "Sreemangal",
    tagline: "Tea capital of Bangladesh",
    properties: "120+ Properties",
    image:
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&h=800&q=80&auto=format&fit=crop",
  },
  {
    name: "Sajek Valley",
    tagline: "Wake up above the clouds",
    properties: "80+ Properties",
    image:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=800&q=80&auto=format&fit=crop",
  },
  {
    name: "Sylhet",
    tagline: "Waterfalls & tea gardens",
    properties: "200+ Properties",
    image:
      "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&h=800&q=80&auto=format&fit=crop",
  },
  {
    name: "Bandarban",
    tagline: "Misty hills & hill trails",
    properties: "150+ Properties",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=800&q=80&auto=format&fit=crop",
  },
  {
    name: "Kuakata",
    tagline: "Sunrise & sunset from one beach",
    properties: "110+ Properties",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=800&q=80&auto=format&fit=crop",
  },
];

export const whyChoose = [
  "5000+ Verified Properties",
  "Best Price Guarantee",
  "Easy & Secure Booking",
  "24/7 Customer Support",
  "Multiple Payment Options",
];

export const footerLinks = {
  company: ["About Us", "How It Works", "Careers", "Blog", "Contact Us"],
  support: [
    "Help Center",
    "Terms & Conditions",
    "Privacy Policy",
    "Refund Policy",
    "Sitemap",
  ],
  partners: ["List Your Property", "Partner Dashboard", "Partner Login"],
};

export const paymentMethods = ["VISA", "Mastercard", "bKash", "Nagad", "Rocket"];
