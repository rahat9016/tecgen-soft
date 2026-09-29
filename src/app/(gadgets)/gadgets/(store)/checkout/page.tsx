import { Suspense } from "react";
import Checkout from "@/src/components/gadgets/Checkout";
import { PageLoader } from "@/src/components/gadgets/shared";

export const metadata = { title: "Checkout | gadgethub" };

export default function CheckoutPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Checkout />
    </Suspense>
  );
}
