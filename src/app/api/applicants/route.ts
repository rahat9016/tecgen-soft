import { NextRequest, NextResponse } from "next/server";
import { applicants } from "./data/data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const search = searchParams.get("search")?.toLowerCase();

  let filteredApplicants = [...applicants];

  if (search) {
    filteredApplicants = filteredApplicants.filter(
      (item) =>
        item.name.toLowerCase().includes(search) ||
        item.email.toLowerCase().includes(search) ||
        item.jobTitle.toLowerCase().includes(search)
    );
  }

  // newest first
  filteredApplicants.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const start = (page - 1) * limit;
  const end = start + limit;

  const paginatedData = filteredApplicants.slice(start, end);

  return NextResponse.json({
    statusCode: 200,
    success: true,
    message: "Applicants retrieved successfully",
    data: paginatedData,
    meta: {
      totalItems: filteredApplicants.length,
      itemCount: paginatedData.length,
      itemsPerPage: limit,
      currentPage: page,
      totalPages: Math.ceil(filteredApplicants.length / limit),
    },
  });
}
