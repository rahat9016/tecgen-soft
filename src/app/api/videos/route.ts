import { NextResponse } from "next/server";
import { videos } from "./data/data";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const id = url.searchParams.get("id"); // 👈 new
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const search = url.searchParams.get("search")?.toLowerCase() || "";

  // 🔹 FIND BY ID
  if (id) {
    const video = videos.find((v) => v.id === id);

    if (!video) {
      return NextResponse.json(
        { success: false, message: "Video not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: video,
    });
  }

  let filtered = videos;

  if (search) {
    filtered = filtered.filter(
      (video) =>
        video.title.toLowerCase().includes(search) ||
        video.description.toLowerCase().includes(search)
    );
  }

  const start = (page - 1) * limit;
  const end = start + limit;

  return NextResponse.json({
    success: true,
    data: filtered.slice(start, end),
    meta: {
      totalItems: filtered.length,
      currentPage: page,
      itemsPerPage: limit,
      totalPages: Math.ceil(filtered.length / limit),
    },
  });
}
