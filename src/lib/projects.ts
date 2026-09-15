export type Project = {
  slug: string;
  name: string;
  category: string;
  description: string;
  image: string;
  solutionSlug: string;
  status: "Client Project" | "Demo Project";
  /** internal route to the actual running demo — real and clickable, not a screenshot */
  liveHref: string;
  /** real screenshots of different live pages within the demo — width/height are the real intrinsic pixel dimensions, used for masonry layout so tiles aren't cropped */
  gallery: { label: string; image: string; href: string; width: number; height: number }[];
  /** the actual user flow through the built modules, in order */
  journey?: string[];
};

// TODO: replace with real delivered projects (image, live URL, one-line result).
// status must stay honest: "Client Project" only for paid, delivered work —
// everything else is "Demo Project". Never relabel a demo as a client project.
export const PROJECTS: Project[] = [
  {
    slug: "ecommerce-demo",
    name: "E-commerce Website",
    category: "E-commerce",
    description:
      "Fashion ও product business-এর জন্য অনলাইন শপ — product, cart, checkout, admin dashboard।",
    image: "/ecommerce.webp",
    solutionSlug: "ecommerce",
    status: "Demo Project",
    liveHref: "/ecommerce",
    gallery: [
      { label: "Storefront", image: "/ecommerce.webp", href: "/ecommerce", width: 1920, height: 3285 },
      {
        label: "Product Page",
        image: "/ecommerce-product.webp",
        href: "/ecommerce/product/mustard-embroidered-salwar-kameez",
        width: 1440,
        height: 900,
      },
    ],
    journey: ["Browse Products", "View Product Details", "Add to Cart", "Checkout", "Order Management"],
  },
  {
    slug: "hotel-booking-demo",
    name: "Hotel Booking Website",
    category: "Hotel Booking",
    description: "Room browsing, booking ও admin management সহ হোটেল/রিসোর্ট বুকিং সিস্টেম।",
    image: "/hotel-management.webp",
    solutionSlug: "hotel-booking",
    status: "Demo Project",
    liveHref: "/hotel-management",
    gallery: [
      {
        label: "Homepage",
        image: "/hotel-management.webp",
        href: "/hotel-management",
        width: 1920,
        height: 2835,
      },
      {
        label: "Hotel Details",
        image: "/hotel-detail.webp",
        href: "/hotel-management/hotel/sea-paradise-resort",
        width: 1440,
        height: 900,
      },
    ],
    journey: ["Browse Rooms", "View Room Details", "Select Dates", "Booking & Payment", "Booking Management"],
  },
];

export function getProject(slug: string) {
  return PROJECTS.find((p) => p.slug === slug);
}
