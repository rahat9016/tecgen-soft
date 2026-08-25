import StoreHeader from "@/src/components/store/Header/StoreHeader";
import StoreFooter from "@/src/components/store/Footer/StoreFooter";
import CartInit from "@/src/components/store/CartInit";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <CartInit />
      <StoreHeader />
      {children}
      <StoreFooter />
    </div>
  );
}
