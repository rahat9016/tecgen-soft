import { Suspense } from "react";
import AdminOrders from "@/src/components/gadgets/admin/AdminOrders";

export default function AdminOrdersPage() {
  return (
    <Suspense>
      <AdminOrders />
    </Suspense>
  );
}
