import { Suspense } from "react";
import AdminNewOrder from "@/src/components/gadgets/admin/AdminNewOrder";

export default function AdminNewOrderPage() {
  return (
    <Suspense>
      <AdminNewOrder />
    </Suspense>
  );
}
