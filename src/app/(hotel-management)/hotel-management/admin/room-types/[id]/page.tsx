import RoomDetail from "@/src/components/hotel/admin/RoomDetail";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RoomDetail key={id} id={id} />;
}
