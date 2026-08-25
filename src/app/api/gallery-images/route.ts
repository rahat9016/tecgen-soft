import { NextResponse } from "next/server";

const galleryImages = [
  "/gallery/gallery3.jpg",
  "/gallery/gallery1.jpg",
  "/gallery/gallery4.jpg",
  "/gallery/gallery2.jpg",
];

export async function GET() {
  return NextResponse.json({
    statusCode: 200,
    success: true,
    message: "Gallery images retrieved successfully",
    data: galleryImages,
  });
}
