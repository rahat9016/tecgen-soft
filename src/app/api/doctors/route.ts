import { NextRequest, NextResponse } from "next/server";
import { doctors } from "./data/data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const id = searchParams.get("id");
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);

  const status = searchParams.get("status");
  const departmentId = searchParams.get("departmentId");
  const bookingType = searchParams.get("bookingType"); // 👈 NEW
  const search = searchParams.get("search")?.toLowerCase();

  /**
   * 🔍 SINGLE DOCTOR BY ID
   */
  if (id) {
    const doctor = doctors.find((item) => item.id === Number(id));

    if (!doctor) {
      return NextResponse.json(
        {
          statusCode: 404,
          success: false,
          message: "Doctor not found",
          data: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      statusCode: 200,
      success: true,
      message: "Doctor retrieved successfully",
      data: doctor,
    });
  }

  /**
   * 📃 DOCTOR LIST
   */
  // Sort newest first
  const sortedDoctors = [...doctors].sort((a, b) => b.id - a.id);

  let filteredDoctors = [...sortedDoctors];

  // Filter by status
  if (status) {
    filteredDoctors = filteredDoctors.filter((item) => item.status === status);
  }

  // Filter by department
  if (departmentId) {
    filteredDoctors = filteredDoctors.filter(
      (item) => item.department.id === Number(departmentId)
    );
  }

  // Filter by bookingType
  if (bookingType) {
    filteredDoctors = filteredDoctors.filter(
      (item) => item.bookingType.toLowerCase() === bookingType.toLowerCase()
    );
  }

  // Search by name / doctorId
  if (search) {
    filteredDoctors = filteredDoctors.filter(
      (item) =>
        item.fullName.toLowerCase().includes(search) ||
        item.doctorId.toLowerCase().includes(search)
    );
  }

  // Pagination
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedDoctors = filteredDoctors.slice(start, end);

  return NextResponse.json({
    statusCode: 200,
    success: true,
    message: "Doctors retrieved successfully",
    data: paginatedDoctors,
    meta: {
      totalItems: filteredDoctors.length,
      itemCount: paginatedDoctors.length,
      itemsPerPage: limit,
      currentPage: page,
      totalPages: Math.ceil(filteredDoctors.length / limit),
    },
  });
}
