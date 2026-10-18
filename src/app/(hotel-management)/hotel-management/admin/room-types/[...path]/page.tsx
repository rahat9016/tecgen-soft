import { redirect } from "next/navigation";

/** Rooms used to live under /room-types; keep old links and bookmarks working. */
export default async function Page({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  redirect(`/hotel-management/admin/rooms/${path.join("/")}`);
}
