import { NextResponse } from "next/server";
import { careers } from "../data/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const career = careers.find((c) => c.id === id);

  if (!career) {
    return NextResponse.json(
      {
        statusCode: 404,
        success: false,
        message: "Career not found",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    statusCode: 200,
    success: true,
    message: "Career retrieved successfully",
    data: career,
  });
}
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const careerIndex = careers.findIndex((c) => c.id === id);

    if (careerIndex === -1) {
      return NextResponse.json(
        {
          statusCode: 404,
          success: false,
          message: "Career not found",
        },
        { status: 404 }
      );
    }

    const {
      image,
      title,
      description,
      vacancy,
      location,
      deadline,
      isActive,
      experience,
      salaryRange,
    } = body;

    // Update only provided fields
    if (title !== undefined) careers[careerIndex].title = title;
    if (description !== undefined)
      careers[careerIndex].description = description;
    if (vacancy !== undefined) careers[careerIndex].vacancy = Number(vacancy);
    if (location !== undefined) careers[careerIndex].location = location;
    if (deadline !== undefined) careers[careerIndex].deadline = deadline;
    if (image !== undefined) careers[careerIndex].image = image;
    if (experience !== undefined) careers[careerIndex].experience = experience;
    if (salaryRange !== undefined)
      careers[careerIndex].salaryRange = salaryRange;
    if (isActive !== undefined) {
      careers[careerIndex].status = isActive === "true" || isActive === true;
    }

    return NextResponse.json({
      statusCode: 200,
      success: true,
      message: "Career updated successfully",
      data: careers[careerIndex],
    });
  } catch (error) {
    console.error("PATCH /career/[id] error:", error);
    return NextResponse.json(
      {
        statusCode: 500,
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
