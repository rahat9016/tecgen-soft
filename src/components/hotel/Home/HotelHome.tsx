import Hero from "./Hero";
import PropertyTypes from "./PropertyTypes";
import PopularDestinations from "./PopularDestinations";
import TopDeals from "./TopDeals";
import GallerySection from "./GallerySection";
import WhyChooseAndReviews from "./WhyChooseAndReviews";
import Newsletter from "./Newsletter";

export default function HotelHome() {
  return (
    <div>
      <Hero />
      <PropertyTypes />
      <PopularDestinations />
      <TopDeals />
      <GallerySection />
      <WhyChooseAndReviews />
      <Newsletter />
    </div>
  );
}
