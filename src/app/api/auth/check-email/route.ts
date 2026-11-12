import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Check if an email is already registered across Supabase Auth and database tables.
 * Enforces "One Email One User" constraint.
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { exists: false, error: "Valid email is required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail === "aethriz.ai@gmail.com") {
      return NextResponse.json(
        {
          exists: true,
          role: "admin",
          message: "This email is reserved for platform administration.",
        },
        { status: 200 }
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

    // 1. Check public.users table
    try {
      const { data: existingUser } = await supabaseAdmin
        .from("users")
        .select("id, email, role")
        .eq("email", cleanEmail)
        .limit(1);

      if (existingUser && existingUser.length > 0) {
        return NextResponse.json({
          exists: true,
          role: existingUser[0].role,
          message: "An account with this email is already registered.",
        });
      }
    } catch (dbErr) {
      console.warn("[Check Email] users table query warning:", dbErr);
    }

    // 2. Check Supabase Auth users via Admin API
    try {
      const { data: authData, error: authErr } =
        await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 100 });

      if (!authErr && authData?.users) {
        const found = authData.users.find(
          (u) =>
            u.email?.toLowerCase() === cleanEmail ||
            (u.user_metadata?.email &&
              String(u.user_metadata.email).toLowerCase() === cleanEmail)
        );

        if (found) {
          const role = (found.user_metadata?.role as string) || "user";
          return NextResponse.json({
            exists: true,
            role,
            message: "An account with this email is already registered.",
          });
        }
      }
    } catch (adminErr) {
      console.warn("[Check Email] auth.admin.listUsers warning:", adminErr);
    }

    return NextResponse.json({ exists: false });
  } catch (err: any) {
    console.error("[Check Email Exception]", err);
    return NextResponse.json(
      { exists: false, error: err?.message || "Server error checking email" },
      { status: 500 }
    );
  }
}

