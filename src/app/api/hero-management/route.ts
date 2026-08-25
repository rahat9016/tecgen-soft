import { NextResponse } from "next/server";

const hero = {
  id: "1",
  title: "Summer Collection",
  description: "Our latest summer collection is now available!",
  images: [
    "/heroImages/home/heroImage1.png",
    "/heroImages/home/heroImage2.jpg",
    "/heroImages/home/heroImage3.jpg",
  ],
};

export async function GET() {
  return NextResponse.json({
    statusCode: 200,
    success: true,
    message: "Hero retrieved successfully",
    data: hero,
  });
}
