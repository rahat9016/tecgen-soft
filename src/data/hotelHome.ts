// Why-choose points and facility details are edited in the admin panel (Content) and live in the hotel store.

export const footerLinks = {
  support: ["About Us", "Help Center", "Cancellation Policy", "Terms & Conditions", "Privacy Policy"],
  explore: [
    { label: "Rooms", href: "/hotel-management/rooms" },
    { label: "Facilities", href: "/hotel-management#facilities" },
    { label: "Gallery", href: "/hotel-management#gallery" },
    { label: "Location", href: "/hotel-management#location" },
    { label: "My Bookings", href: "/hotel-management/my-bookings" },
  ],
};

// Official logos, saved locally in /public/payments.
export const paymentMethods = [
  { name: "Visa", logo: "/payments/visa.svg" },
  { name: "Mastercard", logo: "/payments/mastercard.svg" },
  { name: "bKash", logo: "/payments/bkash.webp" },
  { name: "Nagad", logo: "/payments/nagad.webp" },
  { name: "Rocket", logo: "/payments/rocket.webp" },
];
