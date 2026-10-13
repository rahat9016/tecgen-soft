import { notFound } from "next/navigation";
import { getRoomById, hotel } from "@/src/data/hotels";
import RoomDetailsClient from "@/src/components/hotel/HotelDetails/RoomDetailsClient";

export default async function RoomDetailsPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const room = getRoomById(roomId);

  if (!room) notFound();

  // Keyed so switching to another room resets the page state.
  return <RoomDetailsClient key={room.id} hotel={hotel} room={room} />;
}
