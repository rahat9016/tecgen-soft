"use server";

import { cookies } from "next/headers";

export async function refreshCreate(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("refreshToken", token);
}

export async function refreshDelete() {
  (await cookies()).delete("refreshToken");
}

/**
 * Set role and userId as httpOnly cookies (cannot be read/modified by client-side JS).
 */
export async function setAuthCookies(role: string, userId: string) {
  const cookieStore = await cookies();

  cookieStore.set("role", role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });

  cookieStore.set("userId", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });
}

/**
 * Remove auth-related httpOnly cookies on logout.
 */
export async function removeAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("role");
  cookieStore.delete("userId");
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
}

/**
 * Read role from httpOnly cookie (server-side only).
 */
export async function getAuthRole(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("role")?.value;
}

/**
 * Read userId from httpOnly cookie (server-side only).
 */
export async function getAuthUserId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("userId")?.value;
}
