import Login from "@/src/components/auth/Login/Login";
import { Suspense } from "react";

export default function page() {
  return (
    <div>
      <Suspense>
        <Login />
      </Suspense>
    </div>
  );
}
