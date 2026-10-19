import { redirect } from "next/navigation";

// There's no dashboard: the admin opens on Bookings.
export default function Page() {
  redirect("/hotel-management/admin/bookings");
}
