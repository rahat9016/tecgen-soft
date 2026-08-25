import BookAppointmentSection from "../../shared/BookAppointmentSection";
import HeroSection from "../../shared/HeroSection/HeroSection";
import OurAllBlogsSection from "./OurAllBlogsSection";

export default function Blogs() {
  return (
    <div>
      <HeroSection
        image="/blogs/blogImage.jpg"
        title="Our Blogs"
        description="Explore health insights, tips, and updates from our specialists."
      />
      <OurAllBlogsSection />
      <BookAppointmentSection />
    </div>
  );
}
