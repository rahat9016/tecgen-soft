import { Suspense } from "react";
import GuestAuthForm from "@/src/components/hotel/Account/GuestAuthForm";

export const metadata = { title: "Log in | TripWave Hotel" };

export default function GuestLoginPage() {
  return (
    <Suspense>
      <GuestAuthForm mode="login" />
    </Suspense>
  );
}
