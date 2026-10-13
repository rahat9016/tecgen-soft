import RoomDetailsLoader from "@/src/components/hotel/HotelDetails/RoomDetailsLoader";

export default async function RoomDetailsPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  return <RoomDetailsLoader roomId={roomId} />;
}
