import { NextRequest, NextResponse } from "next/server";
import { companies } from "../data/data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const search = searchParams.get("search")?.toLowerCase() || "";
  const status = searchParams.get("status");

  let filtered = companies;

  // 🔍 Search
  if (search) {
    filtered = filtered.filter((c) =>
      c.companyName.toLowerCase().includes(search)
    );
  }

  // 🎯 Status filter
  if (status) {
    filtered = filtered.filter((c) => c.status === status);
  }

  const totalItems = filtered.length;
  const start = (page - 1) * limit;
  const end = start + limit;

  const data = filtered.slice(start, end);

  return NextResponse.json({
    data,
    meta: {
      totalItems,
      itemCount: data.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    },
  });
}
