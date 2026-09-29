import Link from "next/link";
import {
  BatteryCharging,
  Cable,
  Camera,
  Gamepad2,
  Glasses,
  Headphones,
  House,
  Keyboard,
  Laptop,
  BookOpen,
  Plane,
  Smartphone,
  Speaker,
  Tablet,
  Watch,
  Bluetooth,
} from "lucide-react";
import SectionTitle from "./SectionTitle";

const categories = [
  { icon: Smartphone, name: "Phones" },
  { icon: Tablet, name: "Tablets" },
  { icon: Laptop, name: "Laptops" },
  { icon: Watch, name: "Smart Watch" },
  { icon: Bluetooth, name: "Earbuds" },
  { icon: Headphones, name: "Headphones" },
  { icon: Speaker, name: "Speakers" },
  { icon: BatteryCharging, name: "Power Bank" },
  { icon: Cable, name: "Chargers & Cables" },
  { icon: Gamepad2, name: "Gaming" },
  { icon: Camera, name: "Action Cameras" },
  { icon: Plane, name: "Drones" },
  { icon: House, name: "Smart Home" },
  { icon: BookOpen, name: "E-Readers" },
  { icon: Glasses, name: "VR Headsets" },
  { icon: Keyboard, name: "Keyboard & Mouse" },
];

export default function FeaturedCategories() {
  return (
    <section id="categories" className="container mt-12 scroll-mt-32">
      <SectionTitle title="Featured" highlight="Categories" />
      <ul className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
        {categories.map(({ icon: Icon, name }) => (
          <li key={name}>
            <Link
              href="#featured"
              className="group flex flex-col items-center gap-2 rounded-xl p-3 text-center transition hover:bg-orange-50"
            >
              <span className="flex size-14 items-center justify-center rounded-2xl bg-neutral-50 text-neutral-700 transition group-hover:bg-white group-hover:text-orange-500 group-hover:shadow">
                <Icon className="size-6" strokeWidth={1.6} />
              </span>
              <span className="text-[11px] font-medium text-neutral-700 sm:text-xs">{name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
