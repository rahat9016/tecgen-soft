import RoomsListing from "@/src/components/hotel/Rooms/RoomsListing";

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const stringParams = Object.fromEntries(
    Object.entries(params).flatMap(([key, value]) => (typeof value === "string" ? [[key, value]] : []))
  ) as Record<string, string>;

  return <RoomsListing stringParams={stringParams} />;
}
