import {
  Building2,
  Trees,
  Waves,
  Mountain,
  Landmark,
  Home,
  Warehouse,
  BedDouble,
  LayoutGrid,
} from "lucide-react";

export const propertyTypes = [
  { label: "Budget Hotels", icon: Building2, bg: "bg-emerald-100 text-emerald-700" },
  { label: "Eco Resorts", icon: Trees, bg: "bg-green-100 text-green-700" },
  { label: "Beach Resorts", icon: Waves, bg: "bg-sky-100 text-sky-700" },
  { label: "Mountain Resorts", icon: Mountain, bg: "bg-indigo-100 text-indigo-700" },
  { label: "Luxury Hotels", icon: Landmark, bg: "bg-amber-100 text-amber-700" },
  { label: "Cottages", icon: Home, bg: "bg-orange-100 text-orange-700" },
  { label: "Villas", icon: Warehouse, bg: "bg-violet-100 text-violet-700" },
  { label: "Homestays", icon: BedDouble, bg: "bg-rose-100 text-rose-700" },
  { label: "All Properties", icon: LayoutGrid, bg: "bg-neutral-200 text-neutral-700" },
];

export const destinations = [
  {
    name: "Cox's Bazar",
    properties: "450+ Properties",
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80&auto=format&fit=crop",
  },
  {
    name: "Sreemangal",
    properties: "120+ Properties",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80&auto=format&fit=crop",
  },
  {
    name: "Sajek Valley",
    properties: "80+ Properties",
    image:
      "https://images.unsplash.com/photo-1519449556851-5720b33024e7?w=400&q=80&auto=format&fit=crop",
  },
  {
    name: "Sylhet",
    properties: "200+ Properties",
    image:
      "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=400&q=80&auto=format&fit=crop",
  },
  {
    name: "Bandarban",
    properties: "150+ Properties",
    image:
      "https://images.unsplash.com/photo-1540304453527-62f979142a17?w=400&q=80&auto=format&fit=crop",
  },
  {
    name: "Kuakata",
    properties: "110+ Properties",
    image:
      "https://images.unsplash.com/photo-1520277739336-7bf67edfa768?w=400&q=80&auto=format&fit=crop",
  },
];

export const moreThanStays = [
  {
    title: "Tour Packages",
    subtitle: "Amazing holiday packages for you",
    icon: "TourPackages",
    bg: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Car Rental",
    subtitle: "Book cars at best prices",
    icon: "CarRental",
    bg: "bg-violet-50 text-violet-700",
  },
  {
    title: "Bus Tickets",
    subtitle: "Local & national bus service",
    icon: "BusTickets",
    bg: "bg-rose-50 text-rose-700",
  },
  {
    title: "Flight Tickets",
    subtitle: "Domestic flight booking",
    icon: "FlightTickets",
    bg: "bg-amber-50 text-amber-700",
  },
];

export const whyChoose = [
  "5000+ Verified Properties",
  "Best Price Guarantee",
  "Easy & Secure Booking",
  "24/7 Customer Support",
  "Multiple Payment Options",
];

export const reviews = [
  {
    name: "Tamim Rahman",
    location: "Dhaka, Bangladesh",
    quote:
      "Amazing experience! The booking process was so easy and the hotel was perfect.",
    avatar: 12,
  },
  {
    name: "Nusrat Jahan",
    location: "Chattogram, Bangladesh",
    quote: "Best platform for hotel booking in Bangladesh. Great customer service.",
    avatar: 47,
  },
  {
    name: "Arif Hossain",
    location: "Rajshahi, Bangladesh",
    quote:
      "Very comfortable stay and quick support. Highly recommended TripWave!",
    avatar: 33,
  },
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
