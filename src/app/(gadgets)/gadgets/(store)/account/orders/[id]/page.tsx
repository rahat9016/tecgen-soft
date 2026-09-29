import { Suspense } from "react";
import OrderDetail from "@/src/components/gadgets/account/OrderDetail";
import { PageLoader } from "@/src/components/gadgets/shared";

export default async function AccountOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<PageLoader />}>
      <OrderDetail id={id} />
    </Suspense>
  );
}
