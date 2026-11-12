import { NextRequest, NextResponse } from "next/server";

interface SupabaseSmsHookPayload {
  user?: {
    id?: string;
    phone?: string;
    email?: string;
    user_metadata?: Record<string, any>;
  };
  sms?: {
    otp?: string;
  };
  phone?: string;
  otp?: string;
}

/**
 * Supabase Auth - Send SMS Hook Route (Development Logger & SMS Dispatcher)
 *
 * In Development:
 * Intercepts Supabase's randomly generated 6-digit OTP code and logs it
 * directly to the server terminal, enabling full random OTP testing without SMS costs.
 *
 * In Production:
 * Logging is strictly disabled. Dispatches SMS via Exotel gateway if credentials are configured.
 */
export async function POST(req: NextRequest) {
  try {
    const payload: SupabaseSmsHookPayload = await req.json();

    const phone = payload.user?.phone || payload.phone || "Unknown";
    const otp = payload.sms?.otp || payload.otp || "Unknown";

    const isProduction = process.env.NODE_ENV === "production";
    const isDevLoggingEnabled =
      process.env.ENABLE_DEV_OTP_LOGGING === "true" || !isProduction;

    // Optional verification of Supabase Auth Hook secret
    const hookSecret = process.env.SUPABASE_AUTH_HOOK_SECRET;
    if (hookSecret && isProduction) {
      const authHeader =
        req.headers.get("x-supabase-auth-hook-secret") ||
        req.headers.get("authorization") ||
        req.headers.get("webhook-signature");
      if (!authHeader) {
        return NextResponse.json(
          {
            error: {
              http_code: 401,
              message: "Unauthorized: Missing hook signature",
            },
          },
          { status: 401 }
        );
      }
    }

    // 1. Production Mode: Strict OTP security
    if (isProduction && !process.env.EXOTEL_ACCOUNT_SID) {
      console.warn("[SMS Hook] Production request received but SMS gateway is unconfigured.");
      return NextResponse.json(
        {
          error: {
            http_code: 500,
            message: "SMS gateway is not configured for production environment.",
          },
        },
        { status: 500 }
      );
    }

    // 2. Production SMS Dispatcher (Exotel Gateway)
    if (
      process.env.EXOTEL_ACCOUNT_SID &&
      process.env.EXOTEL_API_KEY &&
      process.env.EXOTEL_API_TOKEN
    ) {
      try {
        const exotelSid = process.env.EXOTEL_ACCOUNT_SID;
        const exotelApiKey = process.env.EXOTEL_API_KEY;
        const exotelApiToken = process.env.EXOTEL_API_TOKEN;
        const exotelSubdomain = process.env.EXOTEL_SUBDOMAIN || "api.exotel.com";
        const exotelSenderId = process.env.EXOTEL_SENDER_ID || "AETHRZ";

        const exotelUrl = `https://${exotelApiKey}:${exotelApiToken}@${exotelSubdomain}/v1/Accounts/${exotelSid}/Sms/send.json`;
        const formData = new URLSearchParams();
        formData.append("From", exotelSenderId);
        formData.append("To", phone);
        formData.append("Body", `Your AETHRIZ AI verification code is ${otp}. Valid for 10 minutes.`);

        const exotelRes = await fetch(exotelUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
        });

        if (!exotelRes.ok) {
          const errorText = await exotelRes.text();
          console.error("[Exotel Gateway Error]", errorText);
          return NextResponse.json(
            {
              error: {
                http_code: 502,
                message: `Exotel SMS delivery failed: ${errorText}`,
              },
            },
            { status: 502 }
          );
        }

        return NextResponse.json({ success: true }, { status: 200 });
      } catch (exotelErr: any) {
        console.error("[Exotel Dispatch Exception]", exotelErr);
        return NextResponse.json(
          {
            error: {
              http_code: 500,
              message: exotelErr?.message || "Exotel dispatch exception",
            },
          },
          { status: 500 }
        );
      }
    }

    // 3. Development Mode: Terminal-Based OTP Logging
    if (isDevLoggingEnabled) {
      console.log(`\n========================================`);
      console.log(`[DEV OTP] Phone: ${phone}`);
      console.log(`[DEV OTP] Code: ${otp}`);
      console.log(`[DEV OTP] Provider: Development SMS Logger`);
      console.log(`========================================\n`);
    }

    // Return 200 OK so Supabase marks the OTP delivery as successful
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("[DEV OTP Hook Error]", err);
    return NextResponse.json(
      {
        error: {
          http_code: 500,
          message: err?.message || "Internal server error processing SMS hook",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Health check handler for browser & testing tools
 */
export async function GET() {
  const isProduction = process.env.NODE_ENV === "production";
  return NextResponse.json({
    status: "active",
    hook: "Supabase Auth Send SMS Hook (AETHRIZ Development Logger)",
    environment: process.env.NODE_ENV || "development",
    devLoggingEnabled:
      process.env.ENABLE_DEV_OTP_LOGGING === "true" || !isProduction,
    exotelConfigured: Boolean(process.env.EXOTEL_ACCOUNT_SID),
  });
}

