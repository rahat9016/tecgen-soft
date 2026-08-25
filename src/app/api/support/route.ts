import { NextResponse } from "next/server";

const supportTickets = Array.from({ length: 50 }, (_, i) => ({
  ticketId: `TCK${(i + 1).toString().padStart(3, "0")}`,
  date: new Date(Date.now() - i * 86400000).toISOString().split("T")[0],
  name: `User ${i + 1}`,
  phone: `+8801${Math.floor(100000000 + Math.random() * 900000000)}`,
  email: `user${i + 1}@example.com`,
  message: `This is a sample message preview for ticket ${i + 1}`,
  status: ["Pending", "In progress", "Resolved"][i % 3],
}));

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page") || 1);
  const limit = Number(url.searchParams.get("limit") || 10);
  const search = url.searchParams.get("search")?.toLowerCase() || "";
  const statusFilter = url.searchParams.get("status") || "";

  // Filter by search
  const filtered = supportTickets.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search) ||
      t.email.toLowerCase().includes(search) ||
      t.message.toLowerCase().includes(search) ||
      t.ticketId.toLowerCase().includes(search);
    const matchStatus = statusFilter ? t.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / limit);
  const offset = (page - 1) * limit;

  const paginated = filtered.slice(offset, offset + limit);

  return NextResponse.json({
    success: true,
    data: paginated,
    meta: {
      totalItems,
      itemCount: paginated.length,
      itemsPerPage: limit,
      totalPages,
      currentPage: page,
    },
  });
}
