export type Solution = {
  slug: string;
  name: string;
  outcome: string;
  forWho: string[];
  price: string;
  priceNote: string;
  delivery: string;
  support: string;
  image?: string;
  features: { title: string; desc: string }[];
  included: string[];
  notIncluded: string[];
  customerProvides: string[];
  weHandle: string[];
};

export const SOLUTIONS: Solution[] = [
  {
    slug: "ecommerce",
    name: "E-commerce Website",
    outcome: "Start selling your products online professionally.",
    forWho: ["Clothing", "Saree", "Cosmetics", "Electronics", "Grocery", "Online shops"],
    price: "৳১৫,০০০",
    priceNote: "One-time development cost",
    delivery: "৭–১০ working days",
    support: "৩ মাস included",
    image: "/ecommerce.webp",
    features: [
      { title: "Product Management", desc: "Add, edit ও manage products নিজেই — developer-এর দরকার নেই।" },
      { title: "Order Management", desc: "একই dashboard থেকে customer order দেখুন ও status manage করুন।" },
      { title: "Category Management", desc: "Product category ও collection নিজে তৈরি ও সাজান।" },
      { title: "Shopping Cart ও Checkout", desc: "Customer-দের জন্য সহজ cart ও checkout flow।" },
      { title: "Mobile Responsive Website", desc: "Desktop, tablet ও mobile — সব ডিভাইসে perfect দেখাবে।" },
    ],
    included: [
      "Website design",
      "Mobile responsive",
      "Admin dashboard",
      "Product ও category management",
      "Order management",
      "Deployment",
      "Basic SEO",
      "Training",
      "৩ মাস support",
    ],
    notIncluded: [
      "Domain renewal",
      "Hosting renewal",
      "bKash/Nagad/SSLCommerz gateway fee",
      "Facebook/Google advertising",
      "Product photography",
      "Additional custom features",
    ],
    customerProvides: ["Business name", "Logo", "Product তথ্য ও ছবি", "Contact তথ্য", "Address", "Social links"],
    weHandle: ["UI design", "Development", "Database", "Admin panel", "Deployment", "Basic training"],
  },
  {
    slug: "hotel-booking",
    name: "Hotel Booking Website",
    outcome: "Take room bookings online without a front-desk phone call.",
    forWho: ["Hotels", "Resorts", "Guest houses"],
    price: "৳২০,০০০",
    priceNote: "One-time development cost",
    delivery: "১০–১৪ working days",
    support: "৩ মাস included",
    image: "/hotel-management.webp",
    features: [
      { title: "Room Management", desc: "Room type, price ও availability নিজেই update করুন।" },
      { title: "Booking System", desc: "Customer অনলাইনে room browse করে সরাসরি booking দিতে পারবে।" },
      { title: "Customer Management", desc: "Booking history ও customer তথ্য এক জায়গায়।" },
      { title: "Admin Dashboard", desc: "সব booking ও room status এক dashboard থেকে manage করুন।" },
      { title: "Mobile Responsive Website", desc: "Desktop ও mobile — সব জায়গা থেকে booking নেওয়া যাবে।" },
    ],
    included: [
      "Website design",
      "Mobile responsive",
      "Admin dashboard",
      "Room management",
      "Booking ও availability system",
      "Deployment",
      "Basic SEO",
      "Training",
      "৩ মাস support",
    ],
    notIncluded: [
      "Domain renewal",
      "Hosting renewal",
      "Payment gateway fee",
      "Facebook/Google advertising",
      "Room photography",
      "Additional custom features",
    ],
    customerProvides: ["Hotel/resort name", "Logo", "Room তথ্য ও ছবি", "Contact তথ্য", "Address", "Social links"],
    weHandle: ["UI design", "Development", "Database", "Admin panel", "Deployment", "Basic training"],
  },
  {
    slug: "business-website",
    name: "Business Website",
    outcome: "A professional online presence that brings you leads.",
    forWho: ["Companies", "Agencies", "Consultants", "Service providers"],
    price: "৳৮,০০০",
    priceNote: "One-time development cost",
    delivery: "৫–৭ working days",
    support: "২ মাস included",
    features: [
      { title: "Professional Pages", desc: "Home, About, Services, Contact — সবকিছু professionally design করা।" },
      { title: "Lead / Contact Form", desc: "Customer সরাসরি form-এর মাধ্যমে আপনার সাথে যোগাযোগ করতে পারবে।" },
      { title: "Mobile Responsive Website", desc: "সব ডিভাইসে সমানভাবে ভালো দেখাবে।" },
    ],
    included: [
      "Website design",
      "Mobile responsive",
      "5 pages পর্যন্ত",
      "Contact form",
      "Basic SEO",
      "Deployment",
      "Training",
      "২ মাস support",
    ],
    notIncluded: [
      "Domain renewal",
      "Hosting renewal",
      "Facebook/Google advertising",
      "Photography",
      "Additional custom features",
    ],
    customerProvides: ["Business name", "Logo", "Service তথ্য", "Contact তথ্য", "Address", "Social links"],
    weHandle: ["UI design", "Development", "Deployment", "Basic training"],
  },
  {
    slug: "restaurant",
    name: "Restaurant Website",
    outcome: "Show your menu and location the way your customers expect.",
    forWho: ["Restaurants", "Cafes", "Food businesses"],
    price: "৳১০,০০০",
    priceNote: "One-time development cost",
    delivery: "৭ working days",
    support: "২ মাস included",
    features: [
      { title: "Menu ও Categories", desc: "Menu item ও category নিজেই add/update করুন।" },
      { title: "Location ও Contact", desc: "Map, address ও contact তথ্য এক জায়গায়।" },
      { title: "Reservation/Order (package অনুযায়ী)", desc: "প্রয়োজনে reservation বা order form যোগ করা যায়।" },
    ],
    included: [
      "Website design",
      "Mobile responsive",
      "Menu ও category pages",
      "Location ও contact page",
      "Basic SEO",
      "Deployment",
      "Training",
      "২ মাস support",
    ],
    notIncluded: [
      "Domain renewal",
      "Hosting renewal",
      "Online payment gateway",
      "Facebook/Google advertising",
      "Food photography",
      "Additional custom features",
    ],
    customerProvides: ["Business name", "Logo", "Menu তথ্য ও ছবি", "Contact তথ্য", "Address", "Social links"],
    weHandle: ["UI design", "Development", "Deployment", "Basic training"],
  },
];

export function getSolution(slug: string) {
  return SOLUTIONS.find((s) => s.slug === slug);
}
