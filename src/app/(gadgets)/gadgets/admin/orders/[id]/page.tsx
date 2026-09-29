import AdminOrderDetail from "@/src/components/gadgets/admin/AdminOrderDetail";

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminOrderDetail id={id} />;
}
