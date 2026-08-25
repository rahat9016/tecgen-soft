import {
  Smartphone,
  Headphones,
  Watch,
  Footprints,
  Shirt,
  SprayCan,
  CookingPot,
  Blend,
  Backpack,
  BookOpen,
  Volleyball,
  Car,
  type LucideIcon,
} from "lucide-react";
import type { ProductIcon } from "@/src/data/products";

export const productIconMap: Record<ProductIcon, LucideIcon> = {
  smartphone: Smartphone,
  headphones: Headphones,
  watch: Watch,
  shoe: Footprints,
  shirt: Shirt,
  perfume: SprayCan,
  cookware: CookingPot,
  blender: Blend,
  backpack: Backpack,
  book: BookOpen,
  football: Volleyball,
  car: Car,
};
