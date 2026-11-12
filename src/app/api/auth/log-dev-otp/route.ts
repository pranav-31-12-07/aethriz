import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Development-Only OTP Terminal Logger
 *
 * Intercepts newly generated Supabase OTPs recorded by the Postgres send_sms_hook
 * and outputs them cleanly to the terminal running `npm run dev`.
 * Strictly disabled in production.
 */
export async function POST(req: NextRequest) {
  // Strictly disabled in production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Disabled in production" }, { status: 403 });
  }

  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      "https://uhxfmrcdmqlivsqhuncb.supabase.co";

    // Use publishable/anon key (we granted public select on dev_sms_logs) or secret key
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_SECRET_KEY ||
      "sb_publishable_AJ5nnYMaWAb0HS1uVdploA_lLPfHy97";

    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    const digitsOnly = String(phone).replace(/\D/g, "");

    let attempts = 0;
    let foundEntry: { phone?: string; otp?: string; created_at?: string } | null = null;

    while (attempts < 4 && !foundEntry) {
      const { data, error } = await supabaseClient
        .from("dev_sms_logs")
        .select("phone, otp, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("[DEV OTP Hook] Query error on dev_sms_logs:", error);
      } else if (data && data.length > 0) {
        // Find matching row by exact phone, digits, or most recent
        const match = data.find((row) => {
          if (!row.phone) return false;
          const rowDigits = String(row.phone).replace(/\D/g, "");
          return (
            row.phone === phone ||
            rowDigits === digitsOnly ||
            rowDigits.endsWith(digitsOnly.slice(-10))
          );
        });

        if (match?.otp) {
          foundEntry = match;
          break;
        } else if (data[0]?.otp) {
          // If no exact match, fallback to the latest row generated in last 60 seconds
          const rowTime = new Date(data[0].created_at).getTime();
          if (Date.now() - rowTime < 60000) {
            foundEntry = data[0];
            break;
          }
        }
      }

      attempts++;
      if (attempts < 4) {
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
    }

    if (foundEntry?.otp) {
      console.log(`\n========================================`);
      console.log(`[DEV OTP] Phone: ${foundEntry.phone || phone}`);
      console.log(`[DEV OTP] Code: ${foundEntry.otp}`);
      console.log(`[DEV OTP] Provider: Development SMS Logger`);
      console.log(`========================================\n`);

      return NextResponse.json({
        success: true,
        phone: foundEntry.phone || phone,
        otp: foundEntry.otp,
      });
    }

    console.warn(`[DEV OTP Hook] No matching OTP found in dev_sms_logs for phone: ${phone}`);
    return NextResponse.json(
      { success: false, message: "No OTP recorded in dev_sms_logs" },
      { status: 404 }
    );
  } catch (err: any) {
    console.error("[DEV OTP Logger Error]", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Health check & diagnostic query
 */
export async function GET() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "https://uhxfmrcdmqlivsqhuncb.supabase.co";

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_AJ5nnYMaWAb0HS1uVdploA_lLPfHy97";

  const supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabaseClient
    .from("dev_sms_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  return NextResponse.json({
    status: "active",
    logsCount: data?.length || 0,
    recentLogs: data || [],
    queryError: error || null,
  });
}
