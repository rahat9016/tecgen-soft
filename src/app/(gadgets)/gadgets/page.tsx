import GadgetHero from "@/src/components/gadgets/GadgetHero";
import ServiceStrip from "@/src/components/gadgets/ServiceStrip";
import FeaturedCategories from "@/src/components/gadgets/FeaturedCategories";
import ProductRail from "@/src/components/gadgets/ProductRail";
import ExchangeBanner from "@/src/components/gadgets/ExchangeBanner";
import StoreInfo from "@/src/components/gadgets/StoreInfo";
import { byBrand, byCategory, byTag, gadgets, newArrivals } from "@/src/data/gadgets";

const brandTabs = ["Apple", "Samsung", "Sony", "DJI", "Amazon", "Xiaomi"].map((brand) => ({
  label: brand,
  items: byBrand(brand),
}));

export default function GadgetsHomePage() {
  return (
    <>
      <GadgetHero />
      <ServiceStrip />
      <FeaturedCategories />

      <ProductRail title="Apple" highlight="Exclusive" items={byTag("apple")} />
      <ProductRail id="deals" title="Exclusive" highlight="Deals" items={byTag("deal")} />

      <ExchangeBanner />

      <ProductRail
        title="Gaming"
        highlight="Zone"
        tabs={[
          { label: "All Gaming", items: byCategory("Gaming", "VR", "Accessories").filter((g) => g.brand !== "Apple") },
          { label: "Consoles", items: byCategory("Gaming").filter((g) => g.name.includes("Console") || g.brand === "Nintendo") },
          { label: "VR Headsets", items: byCategory("VR") },
          { label: "Keyboard & Mouse", items: gadgets.filter((g) => ["Logitech", "Corsair", "Microsoft"].includes(g.brand)) },
        ]}
      />

      <ProductRail
        id="featured"
        title="Featured"
        highlight="Products"
        tabs={[
          { label: "Best Deals", items: byTag("best") },
          { label: "Top Selling", items: byTag("top") },
        ]}
      />

      <ProductRail title="New" highlight="Arrival" items={newArrivals} />

      <ProductRail
        title="Audio"
        highlight="Collection"
        tabs={[
          { label: "All Audio", items: byCategory("Earbuds", "Headphones", "Speakers") },
          { label: "Earbuds", items: byCategory("Earbuds") },
          { label: "Headphones", items: byCategory("Headphones") },
          { label: "Speakers", items: byCategory("Speakers", "Smart Home") },
        ]}
      />

      <ProductRail
        title="Cameras &"
        highlight="Drones"
        items={byCategory("Cameras", "Drones")}
      />

      <ProductRail
        title="Power &"
        highlight="Wearables"
        items={byCategory("Power", "Smart Watch", "E-Readers")}
      />

      <ProductRail title="Top Brand" highlight="Products" tabs={brandTabs} />

      <StoreInfo />
    </>
  );
}
