export type ProductBadge = "20% OFF" | "15% OFF" | "10% OFF" | "NEW" | null;

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  image: string;
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
    category: "Mobile & Accessories",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Samsung_Galaxy_A54_5G_2023.jpg/500px-Samsung_Galaxy_A54_5G_2023.jpg",
    price: 34999,
    originalPrice: 43099,
    badge: "20% OFF",
    rating: 4.5,
    reviewCount: 128,
    description:
      "Experience the Samsung Galaxy A54 5G with an outstanding camera, powerful processor, and all-day battery backup. The best choice for smooth performance with 5G connectivity.",
    stock: 24,
  },
  {
    id: "2",
    slug: "boat-rockerz-450-pro",
    name: "boAt Rockerz 450 Pro",
    category: "Electronics",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Bose_QuietComfort_25_Acoustic_Noise_Cancelling_Headphones_with_Carry_Case.jpg/500px-Bose_QuietComfort_25_Acoustic_Noise_Cancelling_Headphones_with_Carry_Case.jpg",
    price: 1699,
    originalPrice: 1999,
    badge: "15% OFF",
    rating: 4.3,
    reviewCount: 96,
    description:
      "boAt Rockerz 450 Pro wireless headphones — with 40 hours of playback backup, excellent sound quality, and comfortable earcups, perfect for everyday use.",
    stock: 40,
  },
  {
    id: "3",
    slug: "noise-colorfit-pro-4",
    name: "Noise ColorFit Pro 4",
    category: "Electronics",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Huawei_Smartwatch_Fit_2.jpg/500px-Huawei_Smartwatch_Fit_2.jpg",
    price: 2699,
    originalPrice: 2999,
    badge: "10% OFF",
    rating: 4.4,
    reviewCount: 88,
    description:
      "Noise ColorFit Pro 4 smartwatch — your fitness companion with heart rate monitor, SpO2 tracking, 100+ sports modes, and 7 days of battery backup.",
    stock: 33,
  },
  {
    id: "4",
    slug: "nike-air-max-shoes",
    name: "Nike Air Max Shoes",
    category: "Fashion",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Nike_Air_Max_90.jpg/500px-Nike_Air_Max_90.jpg",
    price: 4999,
    originalPrice: null,
    badge: "NEW",
    rating: 4.6,
    reviewCount: 75,
    description:
      "Nike Air Max shoes — with comfortable cushioning, a durable sole, and a stylish design, perfect for everyday wear and sports.",
    stock: 18,
  },
  {
    id: "5",
    slug: "premium-cotton-shirt",
    name: "Premium Cotton Shirt",
    category: "Fashion",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Banana_Republic_Button-Down_Shirt_1_2019-03-21.jpg/500px-Banana_Republic_Button-Down_Shirt_1_2019-03-21.jpg",
    price: 1299,
    originalPrice: 1499,
    badge: "15% OFF",
    rating: 4.2,
    reviewCount: 64,
    description:
      "A premium shirt made from 100% pure cotton fabric — soft, breathable, and suitable for office or any casual occasion.",
    stock: 52,
  },
  {
    id: "6",
    slug: "wild-stone-perfume",
    name: "Wild Stone Perfume",
    category: "Beauty & Health",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Aramis_Cologne_bottle_July_2024.jpg/500px-Aramis_Cologne_bottle_July_2024.jpg",
    price: 639,
    originalPrice: 799,
    badge: "20% OFF",
    rating: 4.1,
    reviewCount: 52,
    description:
      "Wild Stone perfume — a long-lasting fragrance that keeps you fresh all day. Suitable for everyday use and special occasions.",
    stock: 60,
  },
  {
    id: "7",
    slug: "non-stick-cookware-set",
    name: "Non-Stick Cookware Set",
    category: "Home & Kitchen",
    image:
      "https://live.staticflickr.com/4717/26128230038_cb2348c77b_b.jpg",
    price: 2549,
    originalPrice: 2999,
    badge: "15% OFF",
    rating: 4.3,
    reviewCount: 40,
    description:
      "Non-stick cookware set — the ideal set for your kitchen, with even heat distribution, easy cleaning, and a long-lasting coating.",
    stock: 22,
  },
  {
    id: "8",
    slug: "miyako-blender-500w",
    name: "Miyako Blender 500W",
    category: "Home & Kitchen",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Elektrische_blender_van_het_merk_Princess_-_INDUS_V09861.JPG/500px-Elektrische_blender_van_het_merk_Princess_-_INDUS_V09861.JPG",
    price: 1999,
    originalPrice: 2199,
    badge: null,
    rating: 4.0,
    reviewCount: 38,
    description:
      "Miyako 500W blender — with a powerful motor, multiple speed settings, and a durable jar, perfect for juices, smoothies, and grinding spices.",
    stock: 30,
  },
  {
    id: "9",
    slug: "travel-backpack-30l",
    name: "Travel Backpack 30L",
    category: "Fashion",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/School_bag_backpack.jpg/500px-School_bag_backpack.jpg",
    price: 1799,
    originalPrice: null,
    badge: "NEW",
    rating: 4.4,
    reviewCount: 33,
    description:
      "30-liter travel backpack — with water-resistant fabric, multiple compartments, and a laptop sleeve, suitable for travel and everyday use.",
    stock: 27,
  },
  {
    id: "10",
    slug: "the-alchemist-book",
    name: "The Alchemist (Book)",
    category: "Books & Stationery",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/TheAlchemist.jpg/500px-TheAlchemist.jpg",
    price: 315,
    originalPrice: 350,
    badge: "10% OFF",
    rating: 4.7,
    reviewCount: 29,
    description:
      "'The Alchemist' by Paulo Coelho — a worldwide bestselling novel telling an inspiring journey that has won the hearts of millions of readers.",
    stock: 45,
  },
  {
    id: "11",
    slug: "football-size-5",
    name: "Football - Size 5",
    category: "Sports",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Adidas_Telstar.jpg/500px-Adidas_Telstar.jpg",
    price: 799,
    originalPrice: 899,
    badge: null,
    rating: 4.5,
    reviewCount: 26,
    description:
      "Standard size 5 football — with durable stitching and proper air retention, suitable for professional and casual play.",
    stock: 50,
  },
  {
    id: "12",
    slug: "remote-control-car",
    name: "Remote Control Car",
    category: "Toys & Games",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/1969_Ford_Mustang_radio_controlled_car_1.jpg/500px-1969_Ford_Mustang_radio_controlled_car_1.jpg",
    price: 1274,
    originalPrice: 1499,
    badge: "15% OFF",
    rating: 4.2,
    reviewCount: 22,
    description:
      "Remote control car — a fun toy for kids with a high-speed motor, powerful battery, and durable body.",
    stock: 35,
  },
  {
    id: "13",
    slug: "girls-party-dress",
    name: "Girls Party Dress",
    category: "Fashion",
    image: "https://live.staticflickr.com/8507/8572370390_a95a7166f6_b.jpg",
    price: 949,
    originalPrice: 1099,
    badge: "NEW",
    rating: 4.5,
    reviewCount: 18,
    description:
      "Girls party dress — with soft cotton fabric, ruffle design, and comfortable fit, perfect for birthdays, Eid, or any special occasion.",
    stock: 40,
  },
  {
    id: "w1",
    slug: "mustard-embroidered-salwar-kameez",
    name: "Mustard Embroidered Salwar Kameez",
    category: "Women's Fashion",
    image: "/girls/img1.png",
    price: 5499,
    originalPrice: 6999,
    badge: "20% OFF",
    rating: 4.6,
    reviewCount: 41,
    description:
      "Mustard salwar kameez with heavy floral embroidery and a contrast purple dupatta — a stunning pick for weddings and festive occasions.",
    stock: 15,
  },
  {
    id: "w2",
    slug: "purple-net-dupatta-set",
    name: "Purple Net Dupatta 3-Piece Set",
    category: "Women's Fashion",
    image: "/girls/img2.png",
    price: 5299,
    originalPrice: null,
    badge: "NEW",
    rating: 4.5,
    reviewCount: 27,
    description:
      "Elegant mustard kurta paired with an embellished purple net dupatta and matching trousers — perfect for Eid and wedding functions.",
    stock: 12,
  },
  {
    id: "w3",
    slug: "bridal-purple-dupatta-set",
    name: "Bridal Purple Dupatta Set",
    category: "Women's Fashion",
    image: "/girls/img3.png",
    price: 6499,
    originalPrice: 7499,
    badge: "15% OFF",
    rating: 4.7,
    reviewCount: 22,
    description:
      "Premium bridal-style 3-piece set with heavy zari border dupatta, gold jewelry-ready neckline, and rich mustard base fabric.",
    stock: 8,
  },
  {
    id: "w4",
    slug: "rust-embroidered-kurta-set",
    name: "Rust Embroidered Kurta Set",
    category: "Women's Fashion",
    image: "/girls/img4.png",
    price: 4799,
    originalPrice: 5499,
    badge: "10% OFF",
    rating: 4.4,
    reviewCount: 35,
    description:
      "Rust-toned embroidered kurta with beige floral dupatta and matching trousers — a graceful choice for festive gatherings.",
    stock: 20,
  },
  {
    id: "w5",
    slug: "peach-embellished-kurta-set",
    name: "Peach Embellished Kurta Set",
    category: "Women's Fashion",
    image: "/girls/img5.png",
    price: 4999,
    originalPrice: null,
    badge: "NEW",
    rating: 4.5,
    reviewCount: 19,
    description:
      "Soft peach kurta with delicate embroidery and a contrasting orange dupatta, finished with bell sleeves for an elegant silhouette.",
    stock: 14,
  },
  {
    id: "w6",
    slug: "pastel-green-embroidered-jacket-set",
    name: "Pastel Green Embroidered Jacket Set",
    category: "Women's Fashion",
    image: "/girls/img6.png",
    price: 5799,
    originalPrice: 6499,
    badge: "10% OFF",
    rating: 4.6,
    reviewCount: 24,
    description:
      "Open-jacket style pastel green suit with intricate floral embroidery and wide-leg trousers — a modern take on traditional wear.",
    stock: 10,
  },
  {
    id: "w7",
    slug: "black-ruffle-sleeve-suit",
    name: "Black Ruffle-Sleeve Suit",
    category: "Women's Fashion",
    image: "/girls/img7.png",
    price: 3999,
    originalPrice: 4599,
    badge: "15% OFF",
    rating: 4.3,
    reviewCount: 30,
    description:
      "Classic black suit with statement ruffle sleeves, cutwork hem detailing, and a matching sheer dupatta.",
    stock: 25,
  },
  {
    id: "w8",
    slug: "black-gold-print-kaftan",
    name: "Black Gold-Print Kaftan Set",
    category: "Women's Fashion",
    image: "/girls/img8.png",
    price: 3599,
    originalPrice: null,
    badge: "NEW",
    rating: 4.4,
    reviewCount: 16,
    description:
      "Relaxed-fit black kaftan dress paired with a gold-motif printed shawl — effortlessly chic for evening outings.",
    stock: 18,
  },
  {
    id: "w9",
    slug: "kids-maroon-party-frock",
    name: "Kids Maroon Party Frock",
    category: "Women's Fashion",
    image: "/girls/img9.png",
    price: 2299,
    originalPrice: 2699,
    badge: "20% OFF",
    rating: 4.7,
    reviewCount: 12,
    description:
      "Maroon party frock for girls with golden zari embroidery and matching pants — perfect for Eid and birthday celebrations.",
    stock: 22,
  },
  {
    id: "m1",
    slug: "salmon-linen-casual-shirt",
    name: "Salmon Linen Casual Shirt",
    category: "Men's Fashion",
    image: "/mens/img1.png",
    price: 1399,
    originalPrice: 1699,
    badge: "15% OFF",
    rating: 4.3,
    reviewCount: 45,
    description:
      "Breathable salmon linen-blend shirt with a mandarin collar and chest pocket — a relaxed yet sharp everyday look.",
    stock: 34,
  },
  {
    id: "m2",
    slug: "classic-grey-formal-shirt",
    name: "Classic Grey Formal Shirt",
    category: "Men's Fashion",
    image: "/mens/img2.png",
    price: 1199,
    originalPrice: null,
    badge: "NEW",
    rating: 4.5,
    reviewCount: 58,
    description:
      "Wrinkle-resistant grey formal shirt with a slim fit and premium finish — ideal for office wear and formal occasions.",
    stock: 40,
  },
  {
    id: "m3",
    slug: "peach-windowpane-check-shirt",
    name: "Peach Windowpane Check Shirt",
    category: "Men's Fashion",
    image: "/mens/img3.png",
    price: 1499,
    originalPrice: 1799,
    badge: "20% OFF",
    rating: 4.6,
    reviewCount: 37,
    description:
      "Peach windowpane check shirt in soft cotton with a contrast trim collar — smart-casual style for any season.",
    stock: 28,
  },
  {
    id: "m4",
    slug: "blue-plaid-check-shirt",
    name: "Blue Plaid Check Shirt",
    category: "Men's Fashion",
    image: "/mens/img4.png",
    price: 1349,
    originalPrice: 1599,
    badge: "15% OFF",
    rating: 4.4,
    reviewCount: 31,
    description:
      "Light blue and grey plaid check shirt, tailored fit with a soft-touch cotton finish — a versatile weekend staple.",
    stock: 26,
  },
  {
    id: "m5",
    slug: "grey-formal-blazer-suit",
    name: "Grey Formal Blazer Suit",
    category: "Men's Fashion",
    image: "/mens/img5.png",
    price: 6499,
    originalPrice: 7999,
    badge: "20% OFF",
    rating: 4.8,
    reviewCount: 19,
    description:
      "Sharp grey two-piece blazer suit with a modern slim cut — perfect for business meetings, interviews, and formal events.",
    stock: 9,
  },
  {
    id: "m6",
    slug: "sky-blue-gingham-shirt",
    name: "Sky Blue Gingham Shirt",
    category: "Men's Fashion",
    image: "/mens/img6.png",
    price: 999,
    originalPrice: 1199,
    badge: "15% OFF",
    rating: 4.2,
    reviewCount: 42,
    description:
      "Half-sleeve sky blue gingham check shirt in breathable cotton — a crisp, easy-care choice for daily wear.",
    stock: 38,
  },
  {
    id: "m7",
    slug: "black-half-sleeve-shirt",
    name: "Black Half-Sleeve Shirt",
    category: "Men's Fashion",
    image: "/mens/img7.png",
    price: 949,
    originalPrice: null,
    badge: "NEW",
    rating: 4.3,
    reviewCount: 21,
    description:
      "Minimalist black half-sleeve shirt with a smooth matte finish — pairs easily with jeans or chinos for a clean look.",
    stock: 30,
  },
];

export const getProductBySlug = (slug: string) =>
  products.find((p) => p.slug === slug);

export const getRelatedProducts = (product: Product, count = 4) =>
  products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .concat(products.filter((p) => p.id !== product.id && p.category !== product.category))
    .slice(0, count);
