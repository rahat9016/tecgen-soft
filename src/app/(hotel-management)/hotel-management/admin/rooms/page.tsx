import { Suspense } from "react";
import RoomsBoard from "@/src/components/hotel/admin/RoomsBoard";

export default function Page() {
  return (
    <Suspense>
      <RoomsBoard />
    </Suspense>
  );
}
