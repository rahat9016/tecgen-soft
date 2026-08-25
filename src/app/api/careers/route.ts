import { NextRequest, NextResponse } from "next/server";
import { careers } from "./data/data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const status = searchParams.get("status"); // true | false
  const search = searchParams.get("search")?.toLowerCase();

  // ✅ Sort newest first
  const sortedCareers = [...careers].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  let filteredCareers = [...sortedCareers];

  // 🔎 Filter by status
  if (status !== null) {
    filteredCareers = filteredCareers.filter(
      (item) => String(item.status) === status
    );
  }

  // 🔎 Search by title or location
  if (search) {
    filteredCareers = filteredCareers.filter(
      (item) =>
        item.title.toLowerCase().includes(search) ||
        item.location.toLowerCase().includes(search)
    );
  }

  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedCareers = filteredCareers.slice(start, end);

  return NextResponse.json({
    statusCode: 200,
    success: true,
    message: "Careers retrieved successfully",
    data: paginatedCareers,
    meta: {
      totalItems: filteredCareers.length,
      itemCount: paginatedCareers.length,
      itemsPerPage: limit,
      currentPage: page,
      totalPages: Math.ceil(filteredCareers.length / limit),
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

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

    // Validation
    if (
      !title ||
      !description ||
      !vacancy ||
      !location ||
      !deadline ||
      !salaryRange
    ) {
      return NextResponse.json(
        {
          statusCode: 400,
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Generate new ID
    const newId = String(
      Math.max(...careers.map((c) => parseInt(c.id, 10)), 0) + 1
    );

    const newCareer = {
      id: newId,
      image: image || "/specialties/specialties.jpg",
      title,
      salaryRange,
      description,
      vacancy: Number(vacancy),
      location,
      deadline,
      status: isActive === "true" || isActive === true,
      experience: experience || "0 Years",
      createdAt: new Date().toISOString(),
    };

    careers.push(newCareer);

    return NextResponse.json(
      {
        statusCode: 201,
        success: true,
        message: "Career created successfully",
        data: newCareer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /career error:", error);
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
