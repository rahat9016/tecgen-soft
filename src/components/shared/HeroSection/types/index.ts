import { HeroType } from "@/src/app/api/hero/route";

export interface IHeroItem {
  type: HeroType;
  title: string;
  description: string;
  images: string[];
}
