import { isAdminRole } from "@/src/utils/UserRoleEnum";
import { NextRequest, NextResponse } from "next/server";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    const decoded = Buffer.from(payload, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function GET(request: NextRequest) {
  return handleAdminAuth(request);
}

export function POST(request: NextRequest) {
  return handleAdminAuth(request);
}

export function PUT(request: NextRequest) {
  return handleAdminAuth(request);
}

export function PATCH(request: NextRequest) {
  return handleAdminAuth(request);
}

export function DELETE(request: NextRequest) {
  return handleAdminAuth(request);
}

function handleAdminAuth(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;

  // Decode role directly from JWT
  const decoded = accessToken ? decodeJwtPayload(accessToken) : null;
  const role = (decoded?.role as string) ?? undefined;

  const isAdmin = isAdminRole(role);

  // Not logged in → redirect to login
  if (!accessToken) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged in but not admin → redirect to home
  if (!isAdmin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}
