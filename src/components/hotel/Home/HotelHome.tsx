import Hero from "./Hero";
import RoomsSection from "./RoomsSection";
import FacilitiesSection from "./FacilitiesSection";
import GallerySection from "./GallerySection";
import WhyChooseAndReviews from "./WhyChooseAndReviews";
import LocationSection from "./LocationSection";
import Newsletter from "./Newsletter";

export default function HotelHome() {
  return (
    <div>
      <Hero />
      <RoomsSection />
      <FacilitiesSection />
      <GallerySection />
      <WhyChooseAndReviews />
      <LocationSection />
      <Newsletter />
    </div>
  );
}
