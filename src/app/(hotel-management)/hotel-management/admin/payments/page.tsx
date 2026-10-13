import { Suspense } from "react";
import Payments from "@/src/components/hotel/admin/Payments";

export default function Page() {
  return (
    <Suspense>
      <Payments />
    </Suspense>
  );
}
