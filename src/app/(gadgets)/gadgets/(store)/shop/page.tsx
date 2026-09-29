import { Suspense } from "react";
import ShopListing from "@/src/components/gadgets/ShopListing";
import { PageLoader } from "@/src/components/gadgets/shared";

export const metadata = { title: "Shop Gadgets | gadgethub" };

export default function ShopPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ShopListing />
    </Suspense>
  );
}
