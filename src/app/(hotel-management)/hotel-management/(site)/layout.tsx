import HotelHeader from "@/src/components/hotel/Header/HotelHeader";
import HotelFooter from "@/src/components/hotel/Footer/HotelFooter";
import WhatsAppButton from "@/src/components/hotel/shared/WhatsAppButton";

export default function HotelManagementLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="[--hotel-header-h:4.75rem] md:[--hotel-header-h:5.5rem]">
      <HotelHeader />
      {children}
      <HotelFooter />
      <WhatsAppButton />
    </div>
  );
}
