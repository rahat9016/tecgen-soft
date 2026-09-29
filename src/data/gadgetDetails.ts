import type { Gadget, GadgetSpec } from "./gadgets";

type Detail = { description: string; specs: [string, string][]; colors?: string[]; storage?: string[] };

// Per-product copy and key specs. Anything not listed falls back to a category template below.
const details: Record<string, Detail> = {
  "iphone-16-pro-max": {
    description:
      "iPhone 16 Pro Max brings a 6.9-inch Super Retina XDR display, the A18 Pro chip and a titanium design. The 48MP Fusion camera, 5x Telephoto and dedicated Camera Control make it Apple's most capable iPhone for photo and video.",
    specs: [
      ["Display", "6.9\" Super Retina XDR OLED, 120Hz ProMotion"],
      ["Chipset", "Apple A18 Pro"],
      ["Storage", "256GB"],
      ["Rear Camera", "48MP Fusion + 48MP Ultra Wide + 12MP 5x Telephoto"],
      ["Front Camera", "12MP TrueDepth"],
      ["Battery", "Up to 33 hours video playback"],
      ["Build", "Titanium frame, Ceramic Shield"],
    ],
    colors: ["Desert Titanium", "Natural Titanium", "Black Titanium", "White Titanium"],
    storage: ["256GB", "512GB", "1TB"],
  },
  "iphone-17-pro-max": {
    description:
      "The iPhone 17 Pro Max pairs a unibody aluminium design with the A19 Pro chip, a brighter 6.9-inch ProMotion display and an upgraded triple 48MP camera system with longer optical zoom.",
    specs: [
      ["Display", "6.9\" Super Retina XDR OLED, 120Hz ProMotion"],
      ["Chipset", "Apple A19 Pro"],
      ["Storage", "256GB"],
      ["Rear Camera", "Triple 48MP Pro Fusion camera system"],
      ["Front Camera", "18MP Center Stage"],
      ["Battery", "Up to 37 hours video playback"],
    ],
  },
  "iphone-18-pro": {
    description:
      "Be among the first in Bangladesh to own the iPhone 18 Pro. Reserve yours with a refundable deposit — the balance is due on delivery, and pre-order customers get priority dispatch on launch day.",
    specs: [
      ["Display", "6.3\" Super Retina XDR OLED, 120Hz ProMotion"],
      ["Storage", "256GB"],
      ["Launch", "Expected October 2026"],
      ["Pre-order", "Refundable deposit, balance on delivery"],
    ],
  },
  "galaxy-s26-ultra": {
    description:
      "Galaxy S26 Ultra — where power goes ultra. Pre-order now with a refundable deposit and 36 months EMI on selected cards. Pre-order customers receive a free 45W charger.",
    specs: [
      ["Display", "6.9\" Dynamic AMOLED 2X, 120Hz"],
      ["Memory", "12GB RAM / 256GB"],
      ["S Pen", "Built-in"],
      ["Launch", "Expected November 2026"],
      ["Pre-order", "Refundable deposit, balance on delivery"],
    ],
  },
  "iphone-15": {
    description:
      "iPhone 15 features Dynamic Island, a 48MP Main camera with 2x Telephoto option, USB-C and the A16 Bionic chip in a colour-infused glass and aluminium design.",
    specs: [
      ["Display", "6.1\" Super Retina XDR OLED"],
      ["Chipset", "Apple A16 Bionic"],
      ["Storage", "128GB"],
      ["Rear Camera", "48MP Main + 12MP Ultra Wide"],
      ["Front Camera", "12MP TrueDepth"],
      ["Port", "USB-C"],
    ],
    colors: ["Pink", "Yellow", "Green", "Blue", "Black"],
    storage: ["128GB", "256GB", "512GB"],
  },
  "galaxy-s24-ultra": {
    description:
      "Galaxy S24 Ultra is built with a titanium frame, a flat 6.8-inch QHD+ display, built-in S Pen and Galaxy AI features like Circle to Search and Live Translate.",
    specs: [
      ["Display", "6.8\" QHD+ Dynamic AMOLED 2X, 120Hz"],
      ["Chipset", "Snapdragon 8 Gen 3 for Galaxy"],
      ["Memory", "12GB RAM / 256GB"],
      ["Rear Camera", "200MP + 50MP 5x + 10MP 3x + 12MP Ultra Wide"],
      ["Battery", "5000mAh, 45W wired"],
      ["S Pen", "Built-in"],
    ],
    colors: ["Titanium Black", "Titanium Gray", "Titanium Violet", "Titanium Yellow"],
    storage: ["256GB", "512GB"],
  },
  "google-pixel-8": {
    description:
      "Pixel 8 is Google's compact flagship with the Tensor G3 chip, an Actua display and helpful AI photo tools like Magic Editor and Best Take, plus 7 years of OS updates.",
    specs: [
      ["Display", "6.2\" Actua OLED, 120Hz"],
      ["Chipset", "Google Tensor G3"],
      ["Memory", "8GB RAM / 128GB"],
      ["Rear Camera", "50MP Wide + 12MP Ultra Wide"],
      ["Battery", "4575mAh"],
    ],
    colors: ["Rose", "Hazel", "Obsidian"],
  },
  "macbook-air-m2-midnight": {
    description:
      "The redesigned MacBook Air with M2 is strikingly thin and fanless, with a 13.6-inch Liquid Retina display, 1080p FaceTime camera, MagSafe charging and up to 18 hours of battery life.",
    specs: [
      ["Display", "13.6\" Liquid Retina, 500 nits"],
      ["Chip", "Apple M2, 8-core CPU, 8-core GPU"],
      ["Memory", "8GB unified memory"],
      ["Storage", "256GB SSD"],
      ["Battery", "Up to 18 hours"],
      ["Weight", "1.24 kg"],
    ],
    storage: ["256GB", "512GB"],
  },
  "ipad-10th-gen": {
    description:
      "The colourful all-screen iPad (10th generation) with a 10.9-inch Liquid Retina display, A14 Bionic chip, landscape front camera and USB-C.",
    specs: [
      ["Display", "10.9\" Liquid Retina"],
      ["Chip", "A14 Bionic"],
      ["Storage", "64GB"],
      ["Camera", "12MP Wide rear, 12MP landscape front"],
      ["Port", "USB-C"],
    ],
    colors: ["Pink", "Blue", "Yellow", "Silver"],
    storage: ["64GB", "256GB"],
  },
  "airpods-pro-2": {
    description:
      "AirPods Pro (2nd generation) deliver up to 2x more Active Noise Cancellation, Adaptive Audio, Personalised Spatial Audio and a MagSafe USB-C charging case with speaker and lanyard loop.",
    specs: [
      ["Chip", "Apple H2"],
      ["Noise Control", "Active Noise Cancellation, Transparency, Adaptive Audio"],
      ["Battery", "Up to 6h (30h with case)"],
      ["Charging", "USB-C, MagSafe, Qi"],
      ["Water Resistance", "IP54"],
    ],
  },
  "sony-wh-1000xm3": {
    description:
      "Industry-leading noise cancellation with Sony's QN1 processor, 30-hour battery life, quick charge and touch controls in a comfortable, foldable design.",
    specs: [
      ["Driver", "40mm"],
      ["Noise Cancelling", "HD Noise Cancelling Processor QN1"],
      ["Battery", "Up to 30 hours"],
      ["Quick Charge", "10 min = 5 hours"],
      ["Connectivity", "Bluetooth 4.2, NFC, 3.5mm"],
    ],
  },
  "playstation-5": {
    description:
      "PlayStation 5 with an ultra-high-speed SSD, ray tracing, 4K gaming up to 120fps and the DualSense wireless controller with haptic feedback and adaptive triggers.",
    specs: [
      ["CPU", "8-core AMD Zen 2"],
      ["GPU", "10.28 TFLOPS AMD RDNA 2"],
      ["Storage", "825GB SSD"],
      ["Output", "Up to 4K 120Hz, 8K ready"],
      ["Drive", "Ultra HD Blu-ray"],
    ],
  },
  "dji-mini-4-pro": {
    description:
      "DJI Mini 4 Pro weighs under 249g yet shoots 4K/60fps HDR video, with omnidirectional obstacle sensing, ActiveTrack 360° and 20km FHD video transmission.",
    specs: [
      ["Weight", "< 249 g"],
      ["Camera", "1/1.3\" CMOS, 48MP"],
      ["Video", "4K/60fps HDR, 4K/100fps slow-mo"],
      ["Flight Time", "Up to 34 minutes"],
      ["Transmission", "DJI O4, 20 km"],
    ],
  },
};

const categoryTemplate: Record<string, [string, string][]> = {
  Phones: [["Network", "4G / 5G"], ["SIM", "Dual SIM"]],
  Tablets: [["Connectivity", "Wi-Fi"]],
  Laptops: [["OS", "macOS / Windows"]],
  "Smart Watch": [["Compatibility", "Android & iOS"], ["Water Resistance", "Yes"]],
  Earbuds: [["Connectivity", "Bluetooth 5.x"], ["Charging Case", "Included"]],
  Headphones: [["Connectivity", "Bluetooth"], ["Type", "Over-ear"]],
  Speakers: [["Connectivity", "Bluetooth"], ["Water Resistance", "IPX7"]],
  Power: [["Input/Output", "USB-C"], ["Fast Charging", "Supported"]],
  Gaming: [["In the Box", "Console/Device, cables"]],
  Cameras: [["Stabilisation", "Electronic / Gimbal"], ["Video", "4K"]],
  Drones: [["Camera", "4K"]],
  "Smart Home": [["Assistant", "Alexa"], ["Connectivity", "Wi-Fi, Bluetooth"]],
  "E-Readers": [["Display", "E Ink with front light"]],
  VR: [["Tracking", "Inside-out, 6DoF"]],
  Accessories: [["Connectivity", "Wireless / USB"]],
};

export function enrichGadget(g: Gadget): Gadget {
  const d = details[g.slug];
  const base: GadgetSpec[] = [
    { label: "Brand", value: g.brand },
    { label: "Model", value: g.name.split(" — ")[0] },
  ];
  const specs = (d?.specs ?? categoryTemplate[g.category] ?? []).map(([label, value]) => ({ label, value }));
  const warranty = { label: "Warranty", value: g.brand === "Apple" ? "1 Year Apple Care / Official" : "1 Year Official Warranty" };

  return {
    ...g,
    active: g.active ?? true,
    stock: g.stock ?? (g.preOrder ? 0 : 6 + (Number(g.id.replace(/\D/g, "")) * 7) % 40),
    description:
      g.description ??
      d?.description ??
      `Buy the original ${g.name} from gadgethub with official warranty, 0% EMI and fast delivery all over Bangladesh.`,
    specs: g.specs ?? [...base, ...specs, warranty],
    colors: g.colors ?? d?.colors,
    storage: g.storage ?? d?.storage,
  };
}

export const seedCategories = [
  "Phones",
  "Tablets",
  "Laptops",
  "Smart Watch",
  "Earbuds",
  "Headphones",
  "Speakers",
  "Power",
  "Gaming",
  "Cameras",
  "Drones",
  "Smart Home",
  "E-Readers",
  "VR",
  "Accessories",
];

/** Shop details printed on invoices and cash memos. */
export const storeInfo = {
  name: "gadgethub",
  address: "Level 5, Bashundhara City Shopping Complex, Panthapath, Dhaka",
  phone: "09612-345678",
};
