import AdminShell from "@/src/components/gadgets/admin/AdminShell";

export const metadata = { title: "Admin | gadgethub" };

export default function GadgetAdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
