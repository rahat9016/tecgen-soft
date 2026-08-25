import { NextRequest, NextResponse } from "next/server";
import { appointments } from "./data/data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);

  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.toLowerCase();

  // ✅ Sort newest first (by dateTime)
  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  );

  let filteredAppointments = [...sortedAppointments];

  // 🔎 Filter by appointment type
  if (type) {
    filteredAppointments = filteredAppointments.filter(
      (item) => item.appointmentType === type
    );
  }

  // 🔎 Filter by status
  if (status) {
    filteredAppointments = filteredAppointments.filter(
      (item) => item.status.toLowerCase() === status.toLowerCase()
    );
  }

  // 🔎 Search by patientName, doctor, or department
  if (search) {
    filteredAppointments = filteredAppointments.filter(
      (item) =>
        item.patientName.toLowerCase().includes(search) ||
        item.doctor.toLowerCase().includes(search) ||
        item.department.toLowerCase().includes(search)
    );
  }

  const start = (page - 1) * limit;
  const end = start + limit;

  const paginatedAppointments = filteredAppointments.slice(start, end);

  return NextResponse.json({
    statusCode: 200,
    success: true,
    message: "Appointments retrieved successfully",
    data: paginatedAppointments,
    meta: {
      totalItems: filteredAppointments.length,
      itemCount: paginatedAppointments.length,
      itemsPerPage: limit,
      currentPage: page,
      totalPages: Math.ceil(filteredAppointments.length / limit),
    },
  });
}
