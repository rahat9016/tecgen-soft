import AdminShell from "@/src/components/hotel/admin/AdminShell";

export const metadata = { title: "Admin | TripWave Hotel", robots: { index: false } };

export default function HotelAdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
