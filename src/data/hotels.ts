export interface RoomType {
  id: string;
  name: string;
  size: string;
  beds: string;
  capacity: number;
  price: number;
  originalPrice: number;
  available: number;
  amenities: string[];
  image: string;
}

export interface HotelReview {
  name: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  avatar: number;
}

export interface Hotel {
  slug: string;
  name: string;
  category: "Resort" | "Hotel" | "Eco Resort";
  location: string;
  address: string;
  rating: number;
  reviewsCount: number;
  price: number;
  originalPrice: number;
  discount: number;
  description: string;
  images: string[];
  amenities: string[];
  rooms: RoomType[];
  policies: string[];
  nearby: { name: string; distance: string }[];
  reviews: HotelReview[];
}

export const hotels: Hotel[] = [
  {
    slug: "sea-paradise-resort",
    name: "Sea Paradise Resort",
    category: "Resort",
    location: "Cox's Bazar",
    address: "Marine Drive Road, Kolatoli, Cox's Bazar",
    rating: 4.6,
    reviewsCount: 342,
    price: 3200,
    originalPrice: 4900,
    discount: 35,
    description:
      "Sea Paradise Resort sits right on the world's longest natural sea beach, offering panoramic ocean views, a private beach access, and resort-style pools. Perfect for couples, families and groups looking for a relaxed beachfront stay in Cox's Bazar.",
    images: [
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80&auto=format&fit=crop",
    ],
    amenities: [
      "Free WiFi",
      "Swimming Pool",
      "Free Breakfast",
      "Beach Access",
      "AC Rooms",
      "Free Parking",
      "Couple Friendly",
      "Family Friendly",
      "Sea View",
      "24/7 Room Service",
    ],
    rooms: [
      {
        id: "deluxe-sea-view",
        name: "Deluxe Sea View Room",
        size: "350 sq ft",
        beds: "1 King Bed",
        capacity: 2,
        price: 3200,
        originalPrice: 4900,
        available: 4,
        amenities: ["Sea View", "Free WiFi", "AC", "Breakfast Included"],
        image:
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80&auto=format&fit=crop",
      },
      {
        id: "family-suite",
        name: "Family Suite",
        size: "520 sq ft",
        beds: "2 Queen Beds",
        capacity: 4,
        price: 4800,
        originalPrice: 6500,
        available: 2,
        amenities: ["Sea View", "Free WiFi", "AC", "Balcony", "Breakfast Included"],
        image:
          "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80&auto=format&fit=crop",
      },
      {
        id: "honeymoon-suite",
        name: "Honeymoon Suite",
        size: "450 sq ft",
        beds: "1 King Bed",
        capacity: 2,
        price: 5600,
        originalPrice: 7200,
        available: 0,
        amenities: ["Sea View", "Jacuzzi", "Free WiFi", "AC", "Couple Friendly"],
        image:
          "https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=800&q=80&auto=format&fit=crop",
      },
    ],
    policies: [
      "Check-in from 2:00 PM, Check-out until 12:00 PM",
      "Free cancellation up to 24 hours before check-in",
      "Children of all ages are welcome",
      "Pets are not allowed",
      "Smoking is only allowed in designated outdoor areas",
      "Valid photo ID required at check-in",
    ],
    nearby: [
      { name: "Laboni Beach Point", distance: "0.5 km" },
      { name: "Cox's Bazar Airport", distance: "6 km" },
      { name: "Himchari National Park", distance: "12 km" },
      { name: "Aggmeda Khyang", distance: "3 km" },
    ],
    reviews: [
      {
        name: "Tamim Rahman",
        location: "Dhaka, Bangladesh",
        rating: 5,
        date: "2026-06-12",
        comment: "Amazing experience! The booking process was so easy and the hotel was perfect.",
        avatar: 12,
      },
      {
        name: "Nusrat Jahan",
        location: "Chattogram, Bangladesh",
        rating: 5,
        date: "2026-05-28",
        comment: "Best beachfront resort I've stayed at in Cox's Bazar. Great customer service.",
        avatar: 47,
      },
      {
        name: "Arif Hossain",
        location: "Rajshahi, Bangladesh",
        rating: 4,
        date: "2026-04-15",
        comment: "Very comfortable stay and quick support. Highly recommended!",
        avatar: 33,
      },
    ],
  },
  {
    slug: "green-leaf-resort",
    name: "Green Leaf Resort",
    category: "Eco Resort",
    location: "Sreemangal",
    address: "Tea Garden Road, Sreemangal, Moulvibazar",
    rating: 4.4,
    reviewsCount: 210,
    price: 2800,
    originalPrice: 4000,
    discount: 30,
    description:
      "Nestled among rolling tea gardens, Green Leaf Resort offers an eco-friendly escape with nature walks, birdwatching and locally sourced meals. A calm retreat surrounded by greenery, ideal for nature lovers and families.",
    images: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80&auto=format&fit=crop",
    ],
    amenities: [
      "Free WiFi",
      "Nature View",
      "Free Breakfast",
      "Eco Friendly",
      "Free Parking",
      "Family Friendly",
      "Garden",
      "Bonfire Area",
    ],
    rooms: [
      {
        id: "garden-cottage",
        name: "Garden Cottage",
        size: "280 sq ft",
        beds: "1 Queen Bed",
        capacity: 2,
        price: 2800,
        originalPrice: 4000,
        available: 5,
        amenities: ["Nature View", "Free WiFi", "Fan + AC", "Breakfast Included"],
        image:
          "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80&auto=format&fit=crop",
      },
      {
        id: "tea-view-room",
        name: "Tea Garden View Room",
        size: "320 sq ft",
        beds: "2 Twin Beds",
        capacity: 3,
        price: 3400,
        originalPrice: 4600,
        available: 3,
        amenities: ["Nature View", "Free WiFi", "AC", "Balcony"],
        image:
          "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80&auto=format&fit=crop",
      },
    ],
    policies: [
      "Check-in from 1:00 PM, Check-out until 11:00 AM",
      "Free cancellation up to 48 hours before check-in",
      "Eco-friendly property — please minimise plastic use",
      "Pets allowed on request",
      "No smoking inside rooms",
    ],
    nearby: [
      { name: "Lawachara National Park", distance: "8 km" },
      { name: "Madhabpur Lake", distance: "15 km" },
      { name: "Sreemangal Tea Museum", distance: "2 km" },
    ],
    reviews: [
      {
        name: "Farhana Akter",
        location: "Sylhet, Bangladesh",
        rating: 4,
        date: "2026-06-01",
        comment: "Peaceful place surrounded by tea gardens. Loved the morning walks.",
        avatar: 25,
      },
      {
        name: "Shakil Ahmed",
        location: "Dhaka, Bangladesh",
        rating: 5,
        date: "2026-05-10",
        comment: "Great eco resort, staff was very friendly and helpful.",
        avatar: 8,
      },
    ],
  },
  {
    slug: "hill-view-resort",
    name: "Hill View Resort",
    category: "Resort",
    location: "Sajek Valley",
    address: "Konglak Road, Sajek Valley, Rangamati",
    rating: 4.7,
    reviewsCount: 186,
    price: 3000,
    originalPrice: 4000,
    discount: 25,
    description:
      "Perched on top of the hills of Sajek Valley, Hill View Resort offers breathtaking cloud and sunrise views right from your balcony. A favourite spot for adventure seekers and honeymooners alike.",
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519449556851-5720b33024e7?w=1200&q=80&auto=format&fit=crop",
    ],
    amenities: [
      "Free WiFi",
      "Mountain View",
      "Free Breakfast",
      "Bonfire Area",
      "Free Parking",
      "Couple Friendly",
      "Balcony",
      "Trekking Guide",
    ],
    rooms: [
      {
        id: "cloud-view-room",
        name: "Cloud View Room",
        size: "300 sq ft",
        beds: "1 Queen Bed",
        capacity: 2,
        price: 3000,
        originalPrice: 4000,
        available: 3,
        amenities: ["Mountain View", "Free WiFi", "Balcony", "Breakfast Included"],
        image:
          "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80&auto=format&fit=crop",
      },
      {
        id: "sunrise-suite",
        name: "Sunrise Suite",
        size: "400 sq ft",
        beds: "1 King Bed",
        capacity: 3,
        price: 4200,
        originalPrice: 5500,
        available: 1,
        amenities: ["Mountain View", "Private Balcony", "Free WiFi", "AC"],
        image:
          "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&q=80&auto=format&fit=crop",
      },
    ],
    policies: [
      "Check-in from 12:00 PM, Check-out until 10:00 AM",
      "Non-refundable within 72 hours of check-in due to remote location",
      "Roads can be affected by weather — please confirm before travel",
      "No smoking inside rooms",
    ],
    nearby: [
      { name: "Sajek Helipad View Point", distance: "1 km" },
      { name: "Konglak Hill", distance: "3 km" },
      { name: "Ruilui Para", distance: "0.8 km" },
    ],
    reviews: [
      {
        name: "Mahmudul Hasan",
        location: "Chattogram, Bangladesh",
        rating: 5,
        date: "2026-06-20",
        comment: "The view from the balcony is unreal, best sunrise I've ever seen.",
        avatar: 15,
      },
      {
        name: "Rifat Islam",
        location: "Dhaka, Bangladesh",
        rating: 4,
        date: "2026-05-05",
        comment: "A bit remote but totally worth the trip. Staff was very accommodating.",
        avatar: 41,
      },
    ],
  },
  {
    slug: "royal-palace-hotel",
    name: "Royal Palace Hotel",
    category: "Hotel",
    location: "Sylhet",
    address: "Zindabazar, Sylhet City",
    rating: 4.5,
    reviewsCount: 278,
    price: 3600,
    originalPrice: 4500,
    discount: 20,
    description:
      "A premium city hotel in the heart of Sylhet, Royal Palace Hotel combines modern comfort with warm Bangladeshi hospitality. Close to shopping and business districts, it's an ideal base for both leisure and corporate travellers.",
    images: [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551776235-dde6d482980b?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=1200&q=80&auto=format&fit=crop",
    ],
    amenities: [
      "Free WiFi",
      "Swimming Pool",
      "Free Breakfast",
      "AC Rooms",
      "Free Parking",
      "Gym",
      "Airport Shuttle",
      "24/7 Room Service",
      "Conference Room",
    ],
    rooms: [
      {
        id: "executive-room",
        name: "Executive Room",
        size: "320 sq ft",
        beds: "1 King Bed",
        capacity: 2,
        price: 3600,
        originalPrice: 4500,
        available: 6,
        amenities: ["City View", "Free WiFi", "AC", "Breakfast Included"],
        image:
          "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80&auto=format&fit=crop",
      },
      {
        id: "royal-suite",
        name: "Royal Suite",
        size: "550 sq ft",
        beds: "1 King + 1 Sofa Bed",
        capacity: 4,
        price: 5800,
        originalPrice: 7500,
        available: 2,
        amenities: ["City View", "Living Area", "Free WiFi", "AC", "Breakfast Included"],
        image:
          "https://images.unsplash.com/photo-1551776235-dde6d482980b?w=800&q=80&auto=format&fit=crop",
      },
    ],
    policies: [
      "Check-in from 2:00 PM, Check-out until 12:00 PM",
      "Free cancellation up to 24 hours before check-in",
      "Corporate billing available on request",
      "No pets allowed",
      "Smoking rooms available on request, subject to availability",
    ],
    nearby: [
      { name: "Shah Jalal Dargah", distance: "1.5 km" },
      { name: "Osmani International Airport", distance: "10 km" },
      { name: "Ali Amjad's Clock", distance: "1 km" },
    ],
    reviews: [
      {
        name: "Kamrul Hasan",
        location: "Sylhet, Bangladesh",
        rating: 5,
        date: "2026-06-08",
        comment: "Great location for business trips, breakfast spread was excellent.",
        avatar: 22,
      },
      {
        name: "Sadia Islam",
        location: "Dhaka, Bangladesh",
        rating: 4,
        date: "2026-04-30",
        comment: "Clean rooms and responsive front desk. Would stay again.",
        avatar: 9,
      },
    ],
  },
];

export function getHotelBySlug(slug: string) {
  return hotels.find((hotel) => hotel.slug === slug);
}
