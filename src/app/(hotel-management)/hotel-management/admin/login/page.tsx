import { Suspense } from "react";
import StaffLogin from "@/src/components/hotel/admin/StaffLogin";

export const metadata = { title: "Staff login | TripWave Hotel" };

export default function HotelStaffLoginPage() {
  return (
    <Suspense>
      <StaffLogin />
    </Suspense>
  );
}
