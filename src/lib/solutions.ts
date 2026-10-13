export type Solution = {
  slug: string;
  name: string;
  outcome: string;
  forWho: string[];
  /** monthly subscription fee */
  price: string;
  priceNote: string;
  /** time from order until the site is live */
  setup: string;
  support: string;
  image?: string;
  /** internal route to the running demo of this product */
  demoHref?: string;
  features: { title: string; desc: string }[];
  included: string[];
  notIncluded: string[];
  customerProvides: string[];
  weHandle: string[];
};

// Monthly subscription — no upfront cost, billing starts once the site is live, cancel any month.
const SUBSCRIPTION_INCLUDED = ["Hosting ও SSL", "Updates ও bug fixes", "Ongoing support", "Domain setup", "Basic training"];
const SUBSCRIPTION_HANDLED = ["Setup ও customization", "Domain connect", "Hosting ও SSL", "Updates ও maintenance", "Basic training", "Ongoing support"];

export const SOLUTIONS: Solution[] = [
  {
    slug: "hotel-booking",
    name: "Hotel Booking Management",
    outcome: "Take room bookings online without a front-desk phone call.",
    forWho: ["Hotels", "Resorts", "Guest houses"],
    price: "৳১,২৯৯",
    priceNote: "/মাস · কোনো upfront খরচ নেই",
    setup: "১–৩ দিন",
    support: "Subscription চলাকালীন",
    image: "/hotel-management.webp",
    demoHref: "/hotel-management",
    features: [
      { title: "Room Management", desc: "Room type, price ও availability নিজেই update করুন।" },
      { title: "Booking System", desc: "Customer অনলাইনে room browse করে সরাসরি booking দিতে পারবে।" },
      { title: "Customer Management", desc: "Booking history ও customer তথ্য এক জায়গায়।" },
      { title: "Admin Dashboard", desc: "সব booking ও room status এক dashboard থেকে manage করুন।" },
      { title: "Mobile Responsive Website", desc: "Desktop ও mobile — সব জায়গা থেকে booking নেওয়া যাবে।" },
    ],
    included: ["Mobile responsive website", "Admin dashboard", "Room management", "Booking ও availability system", ...SUBSCRIPTION_INCLUDED],
    notIncluded: [
      "Domain কেনা ও renewal (domain আপনার নামে)",
      "Payment gateway fee",
      "Facebook/Google advertising",
      "Room photography",
      "Additional custom features",
    ],
    customerProvides: ["Domain (আপনার নামে)", "Hotel/resort name", "Logo", "Room তথ্য ও ছবি", "Contact তথ্য", "Address"],
    weHandle: SUBSCRIPTION_HANDLED,
  },
  {
    slug: "gadget-ecommerce",
    name: "Gadget E-commerce",
    outcome: "Run your phone & gadget shop online — with pre-orders, EMI and order tracking.",
    forWho: ["Mobile shops", "Gadget stores", "Accessories sellers"],
    price: "৳১,০৯০",
    priceNote: "/মাস · কোনো upfront খরচ নেই",
    setup: "১–৩ দিন",
    support: "Subscription চলাকালীন",
    image: "/solutions/gadget-ecommerce-desktop.webp",
    demoHref: "/gadgets",
    features: [
      { title: "Product, Brand ও Category Management", desc: "Product, brand ও category নিজেই add ও update করুন।" },
      { title: "Pre-order System", desc: "নতুন phone/gadget আসার আগেই deposit নিয়ে pre-order নিন।" },
      { title: "Order ও Order Tracking", desc: "Customer নিজেই order status track করতে পারবে।" },
      { title: "Cash Memo ও Sales Report", desc: "Shop-এর sale-এর cash memo তৈরি করুন, payment method অনুযায়ী হিসাব দেখুন।" },
      { title: "Customer Chat", desc: "Website থেকেই customer-এর সাথে সরাসরি message-এ কথা বলুন।" },
    ],
    included: ["Mobile responsive website", "Admin dashboard", "Pre-order ও order tracking", "Cash memo ও sales report", ...SUBSCRIPTION_INCLUDED],
    notIncluded: [
      "Domain কেনা ও renewal (domain আপনার নামে)",
      "bKash/Nagad/SSLCommerz gateway fee",
      "Facebook/Google advertising",
      "Product photography",
      "Additional custom features",
    ],
    customerProvides: ["Domain (আপনার নামে)", "Shop name", "Logo", "Product তথ্য ও ছবি", "Contact তথ্য", "Address"],
    weHandle: SUBSCRIPTION_HANDLED,
  },
  {
    slug: "ecommerce",
    name: "Fashion E-commerce",
    outcome: "Start selling your clothing and cosmetics online professionally.",
    forWho: ["Clothing", "Saree", "Three-piece", "Cosmetics", "Online shops"],
    price: "৳৯৯৯",
    priceNote: "/মাস · কোনো upfront খরচ নেই",
    setup: "১–৩ দিন",
    support: "Subscription চলাকালীন",
    image: "/ecommerce.webp",
    demoHref: "/ecommerce",
    features: [
      { title: "Product Management", desc: "Add, edit ও manage products নিজেই — developer-এর দরকার নেই।" },
      { title: "Order Management", desc: "একই dashboard থেকে customer order দেখুন ও status manage করুন।" },
      { title: "Category Management", desc: "Product category ও collection নিজে তৈরি ও সাজান।" },
      { title: "Shopping Cart ও Checkout", desc: "Customer-দের জন্য সহজ cart ও checkout flow।" },
      { title: "Mobile Responsive Website", desc: "Desktop, tablet ও mobile — সব ডিভাইসে perfect দেখাবে।" },
    ],
    included: ["Mobile responsive website", "Admin dashboard", "Product ও category management", "Order management", ...SUBSCRIPTION_INCLUDED],
    notIncluded: [
      "Domain কেনা ও renewal (domain আপনার নামে)",
      "bKash/Nagad/SSLCommerz gateway fee",
      "Facebook/Google advertising",
      "Product photography",
      "Additional custom features",
    ],
    customerProvides: ["Domain (আপনার নামে)", "Business name", "Logo", "Product তথ্য ও ছবি", "Contact তথ্য", "Social links"],
    weHandle: SUBSCRIPTION_HANDLED,
  },
  {
    slug: "turf-booking",
    name: "Turf Booking",
    outcome: "Let players book your turf slots online and pay the advance themselves.",
    forWho: ["Football turfs", "Cricket nets", "Indoor courts"],
    price: "৳৮৯৯",
    priceNote: "/মাস · কোনো upfront খরচ নেই",
    setup: "১–৩ দিন",
    support: "Subscription চলাকালীন",
    image: "/solutions/turf-booking-desktop.webp",
    demoHref: "/turf",
    features: [
      { title: "Live Slot Schedule", desc: "প্রতিটি court-এর free ও booked slot live দেখা যায় — double booking হয় না।" },
      { title: "Slot Hold ও Advance Payment", desc: "Payment চলাকালীন slot hold থাকে; customer bKash, Nagad বা card-এ advance দেয়।" },
      { title: "Court ও Peak-hour Pricing", desc: "Court যোগ করুন, সাধারণ ও peak-hour আলাদা price সেট করুন।" },
      { title: "Booking Management", desc: "Admin panel থেকে সব booking, payment ও schedule manage করুন।" },
      { title: "My Bookings", desc: "Player নিজের booking ও status যেকোনো সময় দেখতে পারবে।" },
    ],
    included: ["Mobile responsive website", "Admin dashboard", "Live slot booking", "Advance payment flow", ...SUBSCRIPTION_INCLUDED],
    notIncluded: [
      "Domain কেনা ও renewal (domain আপনার নামে)",
      "bKash/Nagad/SSLCommerz gateway fee",
      "Facebook/Google advertising",
      "Venue photography",
      "Additional custom features",
    ],
    customerProvides: ["Domain (আপনার নামে)", "Turf name", "Logo", "Court তথ্য, ছবি ও price", "Contact তথ্য", "Address"],
    weHandle: SUBSCRIPTION_HANDLED,
  },
];

export function getSolution(slug: string) {
  return SOLUTIONS.find((s) => s.slug === slug);
}
