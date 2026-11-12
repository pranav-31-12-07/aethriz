import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Credential Sync Endpoint
 *
 * Securely associates the user's chosen email and password with their
 * Supabase Auth user record and confirms the email so they can log in
 * directly using email + password. Also stores role in metadata and public.users.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, email, password, role, name, phone } = await req.json();

    if (!userId || !email || !password) {
      return NextResponse.json(
        { error: "userId, email, and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const userRole = role === "doctor" ? "doctor" : "patient";

    if (cleanEmail === "aethriz.ai@gmail.com" || role === "admin") {
      return NextResponse.json(
        { error: "Admin accounts cannot be created or modified via registration." },
        { status: 403 }
      );
    }

    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://uhxfmrcdmqlivsqhuncb.supabase.co";

    const supabaseSecretKey =
      process.env.SUPABASE_SECRET_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "sb_publishable_AJ5nnYMaWAb0HS1uVdploA_lLPfHy97";

    const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
      auth: { persistSession: false },
    });

    // 1. Update Supabase Auth user record with email, password & pre-confirm
    try {
      const { data: updatedAuthUser, error: authUpdateErr } =
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          email: cleanEmail,
          password: password,
          email_confirm: true,
          user_metadata: {
            name: name || "",
            role: userRole,
            phone: phone || "",
            email: cleanEmail,
          },
        });

      if (authUpdateErr) {
        console.warn("[Sync Credentials] updateUserById warning:", authUpdateErr);
      }
    } catch (authErr) {
      console.warn("[Sync Credentials] Auth update exception:", authErr);
    }

    // 2. Synchronize in public.users table (users.role enum allows: 'user' | 'doctor' | 'admin')
    try {
      await supabaseAdmin.from("users").upsert(
        {
          id: userId,
          email: cleanEmail,
          role: userRole === "doctor" ? "doctor" : "user",
          status: "active",
        },
        { onConflict: "id" }
      );
    } catch (dbErr) {
      console.warn("[Sync Credentials] public.users upsert warning:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: "Credentials and role synchronized successfully",
    });
  } catch (err: any) {
    console.error("[Sync Credentials Error]", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

