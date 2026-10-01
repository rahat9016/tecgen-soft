import TurfAdminShell from "@/src/components/turf/admin/TurfAdminShell";

export const metadata = { title: "Admin | TurfHub" };

export default function TurfAdminLayout({ children }: { children: React.ReactNode }) {
  return <TurfAdminShell>{children}</TurfAdminShell>;
}
