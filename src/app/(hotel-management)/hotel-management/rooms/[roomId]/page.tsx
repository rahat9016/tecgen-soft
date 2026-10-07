import { notFound } from "next/navigation";
import { getHotelBySlug } from "@/src/data/hotels";
import HotelDetailsClient from "@/src/components/hotel/HotelDetails/HotelDetailsClient";

export default async function HotelDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hotel = getHotelBySlug(slug);

  if (!hotel) notFound();

  return <HotelDetailsClient hotel={hotel} />;
}
