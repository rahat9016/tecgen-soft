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
  return handleAuthRedirect(request);
}

export function POST(request: NextRequest) {
  return handleAuthRedirect(request);
}

function handleAuthRedirect(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;

  // If not logged in, allow access to auth pages
  if (!accessToken) {
    return NextResponse.next();
  }

  // Decode role directly from JWT
  const decoded = decodeJwtPayload(accessToken);
  const role = (decoded?.role as string) ?? undefined;

  const isAdmin = isAdminRole(role);

  // Logged-in users should be redirected away from login/signup
  if (isAdmin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.redirect(new URL("/", request.url));
}
