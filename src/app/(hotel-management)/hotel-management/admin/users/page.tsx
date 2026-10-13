import { Suspense } from "react";
import UsersManager from "@/src/components/hotel/admin/UsersManager";

export default function Page() {
  return (
    <Suspense>
      <UsersManager />
    </Suspense>
  );
}
