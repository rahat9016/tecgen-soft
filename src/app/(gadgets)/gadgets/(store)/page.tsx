import GadgetHero from "@/src/components/gadgets/GadgetHero";
import ServiceStrip from "@/src/components/gadgets/ServiceStrip";
import FeaturedCategories from "@/src/components/gadgets/FeaturedCategories";
import HomeRails from "@/src/components/gadgets/HomeRails";
import StoreInfo from "@/src/components/gadgets/StoreInfo";

export default function GadgetsHomePage() {
  return (
    <>
      <GadgetHero />
      <ServiceStrip />
      <FeaturedCategories />
      <HomeRails />
      <StoreInfo />
    </>
  );
}
