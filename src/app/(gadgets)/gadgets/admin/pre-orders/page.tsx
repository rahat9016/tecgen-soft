import { Suspense } from "react";
import AdminOrders from "@/src/components/gadgets/admin/AdminOrders";

export default function AdminPreOrdersPage() {
  return (
    <Suspense>
      <AdminOrders preorders />
    </Suspense>
  );
}
