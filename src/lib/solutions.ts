export type Screen = {
  /** who uses the page — the storefront visitor or the business owner */
  group: "customer" | "admin";
  title: string;
  desc: string;
  src: string;
};

export type Tracking = {
  title: string;
  desc: string;
  /** status flow an order/booking moves through in the admin panel */
  steps: { label: string; desc: string }[];
  /** admin screenshot showing those statuses */
  screen?: string;
};

export type Solution = {
  slug: string;
  name: string;
  outcome: string;
  /** Bengali one-liner under the name on the details page */
  tagline: string;
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
  /** real screenshots of every page in the demo */
  screens: Screen[];
  tracking: Tracking;
  included: string[];
  notIncluded: string[];
  customerProvides: string[];
  weHandle: string[];
};

// Monthly subscription — no upfront cost, billing starts once the site is live, cancel any month.
const SUBSCRIPTION_INCLUDED = ["Hosting ও SSL", "Updates ও bug fixes", "Ongoing support", "Domain setup", "Basic training"];
const SUBSCRIPTION_HANDLED = ["Setup ও customization", "Domain connect", "Hosting ও SSL", "Updates ও maintenance", "Basic training", "Ongoing support"];

const screens = (slug: string, list: [Screen["group"], string, string, string][]): Screen[] =>
  list.map(([group, file, title, desc]) => ({ group, title, desc, src: `/solutions/screens/${slug}/${file}.webp` }));

export const SOLUTIONS: Solution[] = [
  {
    slug: "hotel-booking",
    name: "Hotel Booking Management",
    outcome: "Take room bookings online without a front-desk phone call.",
    tagline: "একটি সেরা হোটেল বুকিং প্ল্যাটফর্ম, যা দিয়ে অনলাইনে রুম বুকিং নেওয়া ও হোটেল চালানো হবে আরও সহজ ও লাভজনক।",
    forWho: ["Hotels", "Resorts", "Guest houses"],
    price: "৳১,২৯৯",
    priceNote: "/মাস · শুরুতে কোনো টাকা লাগবে না",
    setup: "১ দিন",
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
    screens: screens("hotel-booking", [
      ["customer", "home", "Home page", "Hero slider থেকেই date ও guest দিয়ে room availability check।"],
      ["customer", "rooms", "Rooms list", "সব room type, price, review ও sort এক page-এ।"],
      ["customer", "room-detail", "Room details", "Photo gallery, amenities, policy ও বাছাই করা date-এর live price।"],
      ["customer", "book", "Booking ও checkout", "Guest তথ্য, ID ও payment — ৩ step-এ booking শেষ।"],
      ["admin", "admin-dashboard", "Admin dashboard", "আজকের arrival, departure, occupancy ও collection এক নজরে।"],
      ["admin", "admin-bookings", "Bookings", "সব booking search, filter ও status manage করুন।"],
      ["admin", "admin-calendar", "Booking calendar", "Room-wise calendar-এ কোন দিন কোন room-এ কে আছে।"],
      ["admin", "admin-rooms", "Rooms board", "প্রতিটি room vacant, occupied না cleaning-এ — live দেখুন।"],
      ["admin", "admin-payments", "Payments", "Payment, refund ও due-এর পুরো হিসাব।"],
      ["admin", "admin-content", "Website content", "Hotel তথ্য, facilities ও rules — developer ছাড়াই edit।"],
    ]),
    tracking: {
      title: "বুকিংয়ের সব তথ্য এক জায়গায়",
      desc: "Guest-এর বুকিং নেওয়া থেকে শুরু করে check-out পর্যন্ত প্রতিটি ধাপ সহজে ট্র্যাক করুন।",
      steps: [
        { label: "Booking request", desc: "Guest অনলাইনে room বুক করেছে।" },
        { label: "Confirmed", desc: "আপনি বুকিং নিশ্চিত করেছেন, guest confirmation পেয়েছে।" },
        { label: "Checked in", desc: "Guest hotel-এ উঠেছে।" },
        { label: "Checked out", desc: "থাকা শেষ, payment-এর হিসাব পরিষ্কার।" },
      ],
      screen: "/solutions/screens/hotel-booking/admin-bookings.webp",
    },
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
    tagline: "একটি সেরা ই-কমার্স প্ল্যাটফর্ম, যা দিয়ে আপনার গ্যাজেট বিজনেস চালানো হবে আরও সহজ ও লাভজনক।",
    forWho: ["Mobile shops", "Gadget stores", "Accessories sellers"],
    price: "৳১,০৯০",
    priceNote: "/মাস · শুরুতে কোনো টাকা লাগবে না",
    setup: "১ দিন",
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
    screens: screens("gadget-ecommerce", [
      ["customer", "home", "Home page", "Banner, EMI offer, category ও featured product।"],
      ["customer", "shop", "Shop ও filter", "Category, brand ও stock দিয়ে product খুঁজে নেওয়া।"],
      ["customer", "product", "Product details", "Color ও storage variant, EMI plan ও price।"],
      ["customer", "cart", "Shopping cart", "Quantity, discount ও free delivery-র হিসাব।"],
      ["customer", "checkout", "Checkout", "Delivery তথ্য দিয়ে Cash on Delivery বা bKash-এ order।"],
      ["customer", "pre-order", "Pre-order", "নতুন launch-এর আগেই deposit দিয়ে reserve।"],
      ["customer", "track-order", "Order tracking", "Order number ও phone দিয়ে customer নিজেই track করে।"],
      ["admin", "admin-dashboard", "Admin dashboard", "Sales, profit, order ও category-wise report।"],
      ["admin", "admin-orders", "Orders", "Online order, payment ও delivery status manage।"],
      ["admin", "admin-products", "Products ও stock", "Product, price, margin ও stock level।"],
      ["admin", "admin-pre-orders", "Pre-orders", "Product-wise reservation ও deposit-এর হিসাব।"],
      ["admin", "admin-cash-memo", "Cash memo", "Shop counter-এর sale, payment ও due-এর memo।"],
      ["admin", "admin-chat", "Customer chat", "Website থেকে আসা message-এর উত্তর এখান থেকেই।"],
      ["admin", "admin-accounts", "Accounts", "Profit & loss, expense ও cash flow।"],
    ]),
    tracking: {
      title: "অর্ডারের সব তথ্য এক জায়গায়",
      desc: "কাস্টমারের অর্ডার নেওয়া থেকে শুরু করে ডেলিভারি হওয়া পর্যন্ত প্রতিটি ধাপ সহজে ট্র্যাক করুন।",
      steps: [
        { label: "Pending", desc: "নতুন অর্ডার এসেছে।" },
        { label: "Confirmed", desc: "কাস্টমারের সাথে কথা বলে অর্ডার নিশ্চিত।" },
        { label: "Processing", desc: "প্রোডাক্ট প্যাক করা হচ্ছে।" },
        { label: "Shipped", desc: "Courier-এ পাঠানো হয়েছে।" },
        { label: "Delivered", desc: "কাস্টমার হাতে পেয়েছে।" },
      ],
      screen: "/solutions/screens/gadget-ecommerce/admin-orders.webp",
    },
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
    tagline: "একটি সেরা ফ্যাশন ই-কমার্স প্ল্যাটফর্ম, যা দিয়ে আপনার কাপড় ও কসমেটিকস বিজনেস চালানো হবে আরও সহজ ও লাভজনক।",
    forWho: ["Clothing", "Saree", "Three-piece", "Cosmetics", "Online shops"],
    price: "৳৯৯৯",
    priceNote: "/মাস · শুরুতে কোনো টাকা লাগবে না",
    setup: "১ দিন",
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
    screens: screens("ecommerce", [
      ["customer", "home", "Home page", "Banner slider, offer ও category।"],
      ["customer", "product", "Product details", "Photo gallery, price, discount ও description।"],
      ["customer", "cart", "Shopping cart", "Cart-এর item, quantity ও total।"],
      ["customer", "checkout", "Checkout", "Delivery তথ্য দিয়ে Cash on Delivery, card বা mobile banking।"],
    ]),
    tracking: {
      title: "অর্ডারের সব তথ্য এক জায়গায়",
      desc: "কাস্টমারের অর্ডার নেওয়া থেকে শুরু করে ডেলিভারি হওয়া পর্যন্ত প্রতিটি ধাপ সহজে ট্র্যাক করুন।",
      steps: [
        { label: "Pending", desc: "নতুন অর্ডার এসেছে।" },
        { label: "Confirmed", desc: "কাস্টমারের সাথে কথা বলে অর্ডার নিশ্চিত।" },
        { label: "Processing", desc: "প্রোডাক্ট প্যাক করা হচ্ছে।" },
        { label: "Shipped", desc: "Courier-এ পাঠানো হয়েছে।" },
        { label: "Delivered", desc: "কাস্টমার হাতে পেয়েছে।" },
      ],
    },
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
    tagline: "একটি সেরা টার্ফ বুকিং প্ল্যাটফর্ম, যা দিয়ে স্লট বুকিং ও অ্যাডভান্স পেমেন্ট নেওয়া হবে আরও সহজ ও লাভজনক।",
    forWho: ["Football turfs", "Cricket nets", "Indoor courts"],
    price: "৳৮৯৯",
    priceNote: "/মাস · শুরুতে কোনো টাকা লাগবে না",
    setup: "১ দিন",
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
    screens: screens("turf-booking", [
      ["customer", "home", "Home page", "Sport, court ও সময় বেছে দ্রুত slot খোঁজা।"],
      ["customer", "book", "Live slot booking", "Free ও booked slot live দেখে slot hold ও advance payment।"],
      ["admin", "admin-dashboard", "Admin dashboard", "আজকের booking, utilization, collection ও verify বাকি payment।"],
      ["admin", "admin-bookings", "Bookings", "সব booking, due ও status এক table-এ।"],
      ["admin", "admin-schedule", "Schedule board", "Court-wise দিনের schedule, walk-in ও slot block।"],
    ]),
    tracking: {
      title: "বুকিংয়ের সব তথ্য এক জায়গায়",
      desc: "Slot বুকিং থেকে শুরু করে খেলা শেষ হওয়া পর্যন্ত প্রতিটি ধাপ সহজে ট্র্যাক করুন।",
      steps: [
        { label: "Slot on hold", desc: "Player slot বেছে নিয়েছে, অন্য কেউ নিতে পারবে না।" },
        { label: "Advance paid", desc: "bKash/Nagad-এ advance দিয়েছে।" },
        { label: "Confirmed", desc: "আপনি payment verify করে বুকিং নিশ্চিত করেছেন।" },
        { label: "Completed", desc: "খেলা শেষ, বাকি টাকার হিসাব পরিষ্কার।" },
      ],
      screen: "/solutions/screens/turf-booking/admin-bookings.webp",
    },
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
