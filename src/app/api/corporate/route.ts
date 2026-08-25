import { NextResponse } from "next/server";

const corporateImages = [
  "/corporate/corporate1.png",
  "/corporate/corporate2.png",
  "/corporate/corporate3.png",
  "/corporate/corporate4.png",
  "/corporate/corporate5.png",
  "/corporate/corporate6.png",
  "/corporate/corporate7.png",
  "/corporate/corporate8.png",
];

export async function GET() {
  return NextResponse.json({
    statusCode: 200,
    success: true,
    message: "Corporate images retrieved successfully",
    data: corporateImages,
  });
}
