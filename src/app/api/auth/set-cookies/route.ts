import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, userId } = body;

    if (
      role === undefined ||
      role === null ||
      userId === undefined ||
      userId === null
    ) {
      return NextResponse.json(
        { error: "role and userId are required", received: body },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    cookieStore.set("role", String(role), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    cookieStore.set("userId", String(userId), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to set auth cookies" },
      { status: 500 }
    );
  }
}
