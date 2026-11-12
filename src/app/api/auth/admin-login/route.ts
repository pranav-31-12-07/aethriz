import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminToken,
  getAdminCredentials,
  verifyAdminRequest,
} from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const payload = verifyAdminRequest(req);
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: "admin-aethriz",
      name: "AETHRIZ Administrator",
      email: payload.email,
      role: "admin",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const providedPassword = String(password || "");

    const creds = getAdminCredentials();

    if (cleanEmail !== creds.email || providedPassword !== creds.password) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid administrator email or password.",
        },
        { status: 401 }
      );
    }

    const token = createAdminToken(cleanEmail);
    const res = NextResponse.json({
      success: true,
      user: {
        id: "admin-aethriz",
        name: "AETHRIZ Administrator",
        email: cleanEmail,
        role: "admin",
      },
    });

    res.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to process admin login." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}

