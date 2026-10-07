export const whyChoose = [
  "0.5 km from Laboni Beach",
  "Sea-view rooms & top-floor suites",
  "Free cancellation up to 24 hours",
  "Free breakfast with most rooms",
  "24/7 room service & front desk",
];

// One-line detail shown under each facility on the home page; keys match `hotel.amenities`.
export const facilityDetails: Record<string, string> = {
  "Free WiFi": "Fast WiFi in every room and public area",
  "Swimming Pool": "Outdoor pool with sun loungers",
  "Free Breakfast": "Daily breakfast with most rooms",
  "Beach Access": "A short walk to Laboni Beach",
  "AC Rooms": "Air-conditioned rooms throughout",
  "Free Parking": "On-site parking at no extra cost",
  "Couple Friendly": "Private, relaxed stays for couples",
  "Family Friendly": "Family rooms and kids of all ages welcome",
  "Sea View": "Ocean views from our rooms",
  "24/7 Room Service": "Food and help whenever you need it",
};

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
