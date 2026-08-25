import { Suspense } from "react";
import OrderSuccess from "@/src/components/store/OrderSuccess/OrderSuccess";

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={null}>
      <OrderSuccess />
    </Suspense>
  );
}
