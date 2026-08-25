import Hero from "./Hero";
import FeatureStrip from "./FeatureStrip";
import CategoryGrid from "./CategoryGrid";
import PromoBanners from "./PromoBanners";
import ProductSection from "./ProductSection";
import StatsBar from "./StatsBar";

export default function Home() {
  return (
    <>
      <Hero />
      <FeatureStrip />
      <CategoryGrid />
      <PromoBanners />
      <ProductSection />
      <StatsBar />
    </>
  );
}
