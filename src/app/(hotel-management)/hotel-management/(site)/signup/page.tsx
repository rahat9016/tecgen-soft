import { Suspense } from "react";
import GuestAuthForm from "@/src/components/hotel/Account/GuestAuthForm";

export const metadata = { title: "Create an account | TripWave Hotel" };

export default function GuestSignupPage() {
  return (
    <Suspense>
      <GuestAuthForm mode="signup" />
    </Suspense>
  );
}
