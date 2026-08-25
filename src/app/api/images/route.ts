import { NextResponse } from "next/server";
import { images } from "./data/data";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const id = url.searchParams.get("id");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const search = url.searchParams.get("search")?.toLowerCase() || "";

  if (id) {
    const image = images.find((img) => Number(img.id) === Number(id));

    if (!image) {
      return NextResponse.json(
        { success: false, message: "Image not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: image,
    });
  }

  // 🔹 List logic
  let filtered = images;

  if (search) {
    filtered = filtered.filter((img) =>
      img.image.toLowerCase().includes(search)
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
