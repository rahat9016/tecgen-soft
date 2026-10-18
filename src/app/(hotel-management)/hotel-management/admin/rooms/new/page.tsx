import RoomForm from "@/src/components/hotel/admin/RoomForm";

export default async function Page({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await searchParams;
  return <RoomForm key={kind ?? "new"} kind={kind} />;
}
