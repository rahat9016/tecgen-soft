import { NextResponse } from "next/server";
import { companies } from "../../data/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const corporate = companies.find((b) => b.id === id);

  if (!corporate) {
    return NextResponse.json(
      {
        statusCode: 404,
        success: false,
        message: "corporate not found",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    statusCode: 200,
    success: true,
    message: "corporate retrieved successfully",
    data: corporate,
  });
}
