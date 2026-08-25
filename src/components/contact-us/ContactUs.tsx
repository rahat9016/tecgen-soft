import HeroSection from "../shared/HeroSection/HeroSection";
import ContactForm from "./ContactForm";
import DirectApproach from "./DirectApproach";

export default function ContactUs() {
  return (
    <div>
      <HeroSection
        image="/heroImages/home/heroImage2.jpg"
        title="Contact Us"
        description="Get in touch with our team for appointments, support, and inquiries."
      />
      <section className="py-10 lg:py-16 xl:py-25">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
            <ContactForm />
            <DirectApproach />
          </div>
        </div>
      </section>
    </div>
  );
}
