import HotelHeader from "@/src/components/hotel/Header/HotelHeader";
import HotelFooter from "@/src/components/hotel/Footer/HotelFooter";
import WhatsAppButton from "@/src/components/hotel/shared/WhatsAppButton";

export default function HotelManagementLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <HotelHeader />
      {children}
      <HotelFooter />
      <WhatsAppButton />
    </div>
  );
}
