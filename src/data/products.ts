export type ProductIcon =
  | "smartphone"
  | "headphones"
  | "watch"
  | "shoe"
  | "shirt"
  | "perfume"
  | "cookware"
  | "blender"
  | "backpack"
  | "book"
  | "football"
  | "car";

export type ProductBadge = "20% OFF" | "15% OFF" | "10% OFF" | "NEW" | null;

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  icon: ProductIcon;
  color: string; // tailwind bg-* class for the icon tile
  price: number;
  originalPrice: number | null;
  badge: ProductBadge;
  rating: number;
  reviewCount: number;
  description: string;
  stock: number;
}

export const products: Product[] = [
  {
    id: "1",
    slug: "samsung-galaxy-a54-5g",
    name: "Samsung Galaxy A54 5G",
    category: "মোবাইল ও এক্সেসরিজ",
    icon: "smartphone",
    color: "bg-violet-100 text-violet-700",
    price: 34999,
    originalPrice: 43099,
    badge: "20% OFF",
    rating: 4.5,
    reviewCount: 128,
    description:
      "Samsung Galaxy A54 5G নিয়ে আসুন দুর্দান্ত ক্যামেরা, শক্তিশালী প্রসেসর এবং সারাদিনের ব্যাটারি ব্যাকআপ। 5G কানেক্টিভিটি সহ স্মুথ পারফরম্যান্সের জন্য সেরা পছন্দ।",
    stock: 24,
  },
  {
    id: "2",
    slug: "boat-rockerz-450-pro",
    name: "boAt Rockerz 450 Pro",
    category: "ইলেকট্রনিক্স",
    icon: "headphones",
    color: "bg-slate-100 text-slate-700",
    price: 1699,
    originalPrice: 1999,
    badge: "15% OFF",
    rating: 4.3,
    reviewCount: 96,
    description:
      "boAt Rockerz 450 Pro ওয়্যারলেস হেডফোন — ৪০ ঘণ্টা প্লেব্যাক ব্যাকআপ, দুর্দান্ত সাউন্ড কোয়ালিটি এবং আরামদায়ক ইয়ারকাপ সহ দৈনন্দিন ব্যবহারের জন্য উপযুক্ত।",
    stock: 40,
  },
  {
    id: "3",
    slug: "noise-colorfit-pro-4",
    name: "Noise ColorFit Pro 4",
    category: "ইলেকট্রনিক্স",
    icon: "watch",
    color: "bg-neutral-200 text-neutral-800",
    price: 2699,
    originalPrice: 2999,
    badge: "10% OFF",
    rating: 4.4,
    reviewCount: 88,
    description:
      "Noise ColorFit Pro 4 স্মার্টওয়াচ — হার্ট রেট মনিটর, SpO2 ট্র্যাকিং, ১০০+ স্পোর্টস মোড এবং ৭ দিনের ব্যাটারি ব্যাকআপ সহ আপনার ফিটনেস সঙ্গী।",
    stock: 33,
  },
  {
    id: "4",
    slug: "nike-air-max-shoes",
    name: "Nike Air Max Shoes",
    category: "ফ্যাশন",
    icon: "shoe",
    color: "bg-sky-100 text-sky-700",
    price: 4999,
    originalPrice: null,
    badge: "NEW",
    rating: 4.6,
    reviewCount: 75,
    description:
      "Nike Air Max জুতা — আরামদায়ক কুশনিং, টেকসই সোল এবং স্টাইলিশ ডিজাইন সহ দৈনন্দিন ব্যবহার ও স্পোর্টসের জন্য পারফেক্ট।",
    stock: 18,
  },
  {
    id: "5",
    slug: "premium-cotton-shirt",
    name: "Premium Cotton Shirt",
    category: "ফ্যাশন",
    icon: "shirt",
    color: "bg-blue-100 text-blue-700",
    price: 1299,
    originalPrice: 1499,
    badge: "15% OFF",
    rating: 4.2,
    reviewCount: 64,
    description:
      "১০০% খাঁটি সুতি কাপড়ে তৈরি প্রিমিয়াম শার্ট — নরম, শ্বাস-প্রশ্বাসযোগ্য এবং অফিস বা ক্যাজুয়াল যেকোনো অনুষ্ঠানের জন্য উপযুক্ত।",
    stock: 52,
  },
  {
    id: "6",
    slug: "wild-stone-perfume",
    name: "Wild Stone Perfume",
    category: "বিউটি ও হেলথ",
    icon: "perfume",
    color: "bg-emerald-100 text-emerald-700",
    price: 639,
    originalPrice: 799,
    badge: "20% OFF",
    rating: 4.1,
    reviewCount: 52,
    description:
      "Wild Stone পারফিউম — দীর্ঘস্থায়ী সুগন্ধ যা সারাদিন আপনাকে সতেজ রাখবে। প্রতিদিনের ব্যবহার ও বিশেষ অনুষ্ঠানের জন্য উপযুক্ত।",
    stock: 60,
  },
  {
    id: "7",
    slug: "non-stick-cookware-set",
    name: "Non-Stick Cookware Set",
    category: "হোম ও কিচেন",
    icon: "cookware",
    color: "bg-rose-100 text-rose-700",
    price: 2549,
    originalPrice: 2999,
    badge: "15% OFF",
    rating: 4.3,
    reviewCount: 40,
    description:
      "নন-স্টিক কুকওয়্যার সেট — সমান তাপ বিতরণ, সহজ পরিষ্কার এবং দীর্ঘস্থায়ী কোটিং সহ আপনার রান্নাঘরের জন্য আদর্শ সেট।",
    stock: 22,
  },
  {
    id: "8",
    slug: "miyako-blender-500w",
    name: "Miyako Blender 500W",
    category: "হোম ও কিচেন",
    icon: "blender",
    color: "bg-amber-100 text-amber-700",
    price: 1999,
    originalPrice: 2199,
    badge: null,
    rating: 4.0,
    reviewCount: 38,
    description:
      "Miyako 500W ব্লেন্ডার — শক্তিশালী মোটর, একাধিক স্পিড সেটিং এবং টেকসই জার সহ জুস, স্মুদি ও মসলা বাটার জন্য উপযুক্ত।",
    stock: 30,
  },
  {
    id: "9",
    slug: "travel-backpack-30l",
    name: "Travel Backpack 30L",
    category: "ফ্যাশন",
    icon: "backpack",
    color: "bg-teal-100 text-teal-700",
    price: 1799,
    originalPrice: null,
    badge: "NEW",
    rating: 4.4,
    reviewCount: 33,
    description:
      "৩০ লিটার ট্রাভেল ব্যাকপ্যাক — জলরোধী কাপড়, একাধিক কম্পার্টমেন্ট এবং ল্যাপটপ স্লিভ সহ ভ্রমণ ও দৈনন্দিন ব্যবহারের জন্য উপযুক্ত।",
    stock: 27,
  },
  {
    id: "10",
    slug: "the-alchemist-book",
    name: "The Alchemist (Book)",
    category: "বই ও স্টেশনারি",
    icon: "book",
    color: "bg-orange-100 text-orange-700",
    price: 315,
    originalPrice: 350,
    badge: "10% OFF",
    rating: 4.7,
    reviewCount: 29,
    description:
      "Paulo Coelho রচিত বিশ্বজুড়ে বেস্টসেলিং উপন্যাস 'The Alchemist' — একটি অনুপ্রেরণামূলক যাত্রার গল্প যা লক্ষ লক্ষ পাঠকের মন জয় করেছে।",
    stock: 45,
  },
  {
    id: "11",
    slug: "football-size-5",
    name: "Football - Size 5",
    category: "স্পোর্টস",
    icon: "football",
    color: "bg-lime-100 text-lime-700",
    price: 799,
    originalPrice: 899,
    badge: null,
    rating: 4.5,
    reviewCount: 26,
    description:
      "স্ট্যান্ডার্ড সাইজ ৫ ফুটবল — টেকসই সেলাই এবং সঠিক এয়ার রিটেনশন সহ প্রফেশনাল ও ক্যাজুয়াল খেলার জন্য উপযুক্ত।",
    stock: 50,
  },
  {
    id: "12",
    slug: "remote-control-car",
    name: "Remote Control Car",
    category: "টয়েজ ও গেমস",
    icon: "car",
    color: "bg-red-100 text-red-700",
    price: 1274,
    originalPrice: 1499,
    badge: "15% OFF",
    rating: 4.2,
    reviewCount: 22,
    description:
      "রিমোট কন্ট্রোল কার — হাই-স্পিড মোটর, শক্তিশালী ব্যাটারি এবং টেকসই বডি সহ বাচ্চাদের জন্য দারুণ মজার খেলনা।",
    stock: 35,
  },
];

export const getProductBySlug = (slug: string) =>
  products.find((p) => p.slug === slug);

export const getRelatedProducts = (product: Product, count = 4) =>
  products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .concat(products.filter((p) => p.id !== product.id && p.category !== product.category))
    .slice(0, count);
