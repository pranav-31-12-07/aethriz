import crypto from "crypto";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const ADMIN_COOKIE_NAME = "aethriz_admin_session";

export function getAdminCredentials() {
  return {
    email: (process.env.ADMIN_EMAIL || "aethriz.ai@gmail.com").trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD || "aethriz@2026",
  };
}

function getSigningSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SECRET_KEY ||
    "aethriz-admin-hmac-secret-2026"
  );
}

export interface AdminTokenPayload {
  email: string;
  role: "admin";
  iat: number;
  exp: number;
}

export function createAdminToken(email: string): string {
  const now = Date.now();
  const payload: AdminTokenPayload = {
    email: email.trim().toLowerCase(),
    role: "admin",
    iat: now,
    exp: now + 24 * 60 * 60 * 1000, // 24 hours
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSigningSecret())
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${sig}`;
}

export function verifyAdminToken(token?: string | null): AdminTokenPayload | null {
  if (!token || !token.includes(".")) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [encodedPayload, providedSig] = parts;
  const expectedSig = crypto
    .createHmac("sha256", getSigningSecret())
    .update(encodedPayload)
    .digest("base64url");

  try {
    const a = Buffer.from(providedSig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return null;
    }

    const parsed = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as AdminTokenPayload;

    const { email: adminEmail } = getAdminCredentials();
    if (
      parsed.role !== "admin" ||
      parsed.email !== adminEmail ||
      typeof parsed.exp !== "number" ||
      parsed.exp < Date.now()
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function verifyAdminRequest(req: NextRequest): AdminTokenPayload | null {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}

export function getSupabaseAdminClient() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://uhxfmrcdmqlivsqhuncb.supabase.co";

  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  if (!supabaseSecretKey) {
    throw new Error(
      "Missing SUPABASE_SECRET_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) environment variable in deployment settings."
    );
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false },
  });
}

