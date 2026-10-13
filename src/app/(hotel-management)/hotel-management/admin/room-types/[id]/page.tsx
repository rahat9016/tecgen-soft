import RoomTypeForm from "@/src/components/hotel/admin/RoomTypeForm";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RoomTypeForm key={id} id={id} />;
}
