import RoomForm from "@/src/components/hotel/admin/RoomForm";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RoomForm key={id} id={id} />;
}
