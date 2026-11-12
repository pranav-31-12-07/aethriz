import { createClient } from "@supabase/supabase-js";

// Normalize Supabase URL (strip /rest/v1 if included in base URL)
const rawUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://uhxfmrcdmqlivsqhuncb.supabase.co";

const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_AJ5nnYMaWAb0HS1uVdploA_lLPfHy97";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Standard E.164 phone number formatting
 * Converts:
 *  - '8956639598' -> '+918956639598'
 *  - '+918956639598' -> '+918956639598'
 *  - '+91 89566 39598' -> '+918956639598'
 *  - '08956639598' -> '+918956639598'
 *  - '918956639598' -> '+918956639598'
 */
export function formatToE164(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.trim().replace(/[^\d+]/g, "");

  // If starts with 0 and followed by 10 digits (e.g. 08956639598), strip leading 0
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }

  // If already starts with +
  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  // If starts with 91 and has 12 digits (e.g. 918956639598)
  if (cleaned.startsWith("91") && cleaned.length === 12) {
    return `+${cleaned}`;
  }

  // If standard 10-digit Indian number (e.g. 8956639598)
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }

  return `+${cleaned}`;
}

/**
 * Send SMS OTP via Supabase Auth signInWithOtp
 * Passes form metadata under options.data
 */
export async function sendPhoneOtp(
  phone: string,
  metadata?: Record<string, any>
) {
  const formattedPhone = formatToE164(phone);

  if (!formattedPhone) {
    return {
      success: false,
      formattedPhone: "",
      error: "Phone number is required",
    };
  }

  try {
    console.log(`[Supabase Auth] Requesting OTP for phone: ${formattedPhone}`);
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
      options: metadata
        ? {
            data: metadata,
          }
        : undefined,
    });

    if (error) {
      console.warn(`[Supabase Auth] signInWithOtp error:`, error);
      let friendlyError = error.message;
      if (
        error.message?.includes("does not exist") ||
        (error as any).code === "sms_send_failed"
      ) {
        friendlyError = `Unable to dispatch SMS to ${formattedPhone}. For random OTPs, enable the Send SMS Hook in Supabase Dashboard (Authentication -> Hooks -> Send SMS) pointing to your dev endpoint. Alternatively, verify ${formattedPhone} is configured under Authentication -> Providers -> Phone -> Phone numbers for testing.`;
      }
      return {
        success: false,
        formattedPhone,
        error: friendlyError,
      };
    }

    console.log(`[Supabase Auth] OTP request succeeded for: ${formattedPhone}`);

    // Development only: Trigger terminal logging for Postgres hook
    if (process.env.NODE_ENV !== "production") {
      try {
        await fetch("/api/auth/log-dev-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: formattedPhone }),
        });
      } catch (logErr) {
        // Dev logging helper, ignore error
      }
    }

    return {
      success: true,
      formattedPhone,
      data,
      message: `Verification code sent to ${formattedPhone}`,
    };
  } catch (err: any) {
    console.error(`[Supabase Auth] signInWithOtp exception:`, err);
    return {
      success: false,
      formattedPhone,
      error: err?.message || "Network error while requesting OTP",
    };
  }
}

/**
 * Verify SMS OTP via Supabase Auth verifyOtp
 * Verifies the 6-digit token against Supabase Auth.
 */
export async function verifyPhoneOtp(phone: string, token: string) {
  const formattedPhone = formatToE164(phone);
  const cleanToken = token.trim();

  if (!formattedPhone) {
    return {
      success: false,
      formattedPhone: "",
      error: "Phone number is required",
    };
  }

  if (!cleanToken) {
    return {
      success: false,
      formattedPhone,
      error: "Verification code is required",
    };
  }

  try {
    console.log(`[Supabase Auth] Verifying OTP token for: ${formattedPhone}`);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: cleanToken,
      type: "sms",
    });

    if (error) {
      console.warn(`[Supabase Auth] verifyOtp error:`, error);
      return {
        success: false,
        formattedPhone,
        error: error.message || "Invalid or expired verification code",
      };
    }

    console.log(`[Supabase Auth] verifyOtp verified successfully! User:`, data.user?.id);
    return {
      success: true,
      formattedPhone,
      user: data.user,
      session: data.session,
    };
  } catch (err: any) {
    console.error(`[Supabase Auth] verifyOtp exception:`, err);
    return {
      success: false,
      formattedPhone,
      error: err?.message || "An unexpected error occurred during verification",
    };
  }
}

/**
 * Patient Registration Data
 */
export interface PatientRegistrationData {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  gender?: string;
  dob?: string | null;
  address?: string | null;
  diet?: string;
  goals?: string[];
  ageGroup?: string;
  sleepHours?: number;
  language?: string;
  height?: number | null;
  weight?: number | null;
  bp?: string | null;
  medicalHistory?: string | null;
  allergies?: string | null;
}

/**
 * Explicitly save Patient Profile and Health Details to Supabase Database
 * Updates: public.user_profiles, public.health_details, and public.users
 */
export async function savePatientDatabaseProfile(
  userId: string,
  data: PatientRegistrationData
) {
  const formattedPhone = formatToE164(data.phone);

  try {
    // 1. Update public.users table (Stores BOTH patients and doctors)
    try {
      await supabase.from("users").upsert(
        {
          id: userId,
          email: data.email,
          role: "user",
          status: "active",
        },
        { onConflict: "id" }
      );
    } catch (e) {
      console.warn("[Database] users update warning:", e);
    }

    // Ensure patients are NOT in doctor_profiles
    try {
      await supabase.from("doctor_profiles").delete().eq("user_id", userId);
    } catch (e) {
      // ignore
    }

    // 2. Explicitly update / upsert public.user_profiles (Patients/Users ONLY)
    const userProfilePayload: Record<string, any> = {
      user_id: userId,
      name: data.fullName,
      phone: formattedPhone || data.phone,
    };
    if (data.gender) userProfilePayload.gender = data.gender;
    if (data.dob) userProfilePayload.dob = data.dob;
    if (data.address) userProfilePayload.address = data.address;

    const upRes = await supabase.from("user_profiles").upsert(
      userProfilePayload,
      { onConflict: "user_id" }
    );
    if (upRes.error) {
      console.warn("[Database] user_profiles update error:", upRes.error);
    }

    // 3. Explicitly insert / upsert public.health_details
    const otherDetailsObj = {
      diet: data.diet || "",
      goals: data.goals || [],
      ageGroup: data.ageGroup || "",
      sleepHours: data.sleepHours || 7,
      language: data.language || "",
    };

    const healthPayload: Record<string, any> = {
      user_id: userId,
      height: data.height || null,
      weight: data.weight || null,
      bp: data.bp || null,
      medical_history:
        data.medicalHistory ||
        (data.goals && data.goals.length > 0 ? data.goals.join(", ") : null),
      allergies: data.allergies || null,
      other_details: JSON.stringify(otherDetailsObj),
      updated_at: new Date().toISOString(),
    };

    const hdRes = await supabase.from("health_details").upsert(
      healthPayload,
      { onConflict: "user_id" }
    );
    if (hdRes.error) {
      console.warn("[Database] health_details update error:", hdRes.error);
    }

    // 4. Update Supabase Auth user credentials & metadata
    try {
      if (data.password && typeof window !== "undefined") {
        await fetch("/api/auth/sync-credentials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            email: data.email,
            password: data.password,
            role: "patient",
            name: data.fullName,
            phone: formattedPhone || data.phone,
          }),
        }).catch(() => null);
      }

      await supabase.auth.updateUser({
        email: data.email,
        password: data.password,
        data: {
          name: data.fullName,
          email: data.email,
          role: "patient",
          diet: data.diet,
          goals: data.goals,
          language: data.language,
        },
      });
    } catch (e) {
      console.warn("[Database] auth.updateUser warning:", e);
    }

    return {
      success: !upRes.error && !hdRes.error,
      error: upRes.error?.message || hdRes.error?.message,
    };
  } catch (err: any) {
    console.error("[Database] savePatientDatabaseProfile exception:", err);
    return { success: false, error: err?.message };
  }
}

/**
 * Doctor Registration Data
 */
export interface DoctorRegistrationData {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  medicalRegNo: string;
  specialty: string;
  hospital?: string;
  experience?: string;
  qualification?: string;
  languages?: string[];
  bio?: string;
}

/**
 * Explicitly save Doctor Profile to Supabase Database
 * Updates: public.doctor_profiles and public.users (Doctors are NOT stored in user_profiles)
 */
export async function saveDoctorDatabaseProfile(
  userId: string,
  data: DoctorRegistrationData
) {
  const formattedPhone = formatToE164(data.phone);
  const doctorName = data.fullName.trim().startsWith("Dr.")
    ? data.fullName.trim()
    : `Dr. ${data.fullName.trim()}`;
  const experienceYears =
    parseInt(String(data.experience || "").replace(/\D/g, ""), 10) || 0;

  try {
    // 1. Update public.users table (Stores BOTH doctors and patients)
    try {
      await supabase.from("users").upsert(
        {
          id: userId,
          email: data.email,
          role: "doctor",
          status: "active",
        },
        { onConflict: "id" }
      );
    } catch (e) {
      console.warn("[Database] users update warning:", e);
    }

    // 2. Ensure doctors are NOT stored in user_profiles (user_profiles is strictly for patients)
    try {
      await supabase.from("user_profiles").delete().eq("user_id", userId);
    } catch (e) {
      // ignore
    }

    // 3. Explicitly insert / upsert public.doctor_profiles (Doctors ONLY)
    const bioText = data.bio
      ? data.hospital
        ? `${data.hospital} | ${data.bio}`
        : data.bio
      : data.hospital || "";

    const dpRes = await supabase.from("doctor_profiles").upsert(
      {
        user_id: userId,
        name: doctorName,
        specialization: data.specialty,
        qualification: data.qualification || "",
        experience: experienceYears,
        registration_no: data.medicalRegNo,
        bio: bioText,
        availability: {
          hospital: data.hospital || "",
          languages: data.languages || [],
        },
        verification_status: "pending",
      },
      { onConflict: "user_id" }
    );
    if (dpRes.error) {
      console.warn("[Database] doctor_profiles update error:", dpRes.error);
    }

    // 4. Update Supabase Auth user credentials & metadata
    try {
      if (data.password && typeof window !== "undefined") {
        await fetch("/api/auth/sync-credentials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            email: data.email,
            password: data.password,
            role: "doctor",
            name: doctorName,
            phone: formattedPhone || data.phone,
          }),
        }).catch(() => null);
      }

      await supabase.auth.updateUser({
        email: data.email,
        password: data.password,
        data: {
          name: doctorName,
          email: data.email,
          role: "doctor",
          specialty: data.specialty,
          medicalRegNo: data.medicalRegNo,
          qualification: data.qualification,
          experience: data.experience,
          hospital: data.hospital,
          languages: data.languages,
        },
      });
    } catch (e) {
      console.warn("[Database] auth.updateUser warning:", e);
    }

    return {
      success: !dpRes.error,
      error: dpRes.error?.message,
    };
  } catch (err: any) {
    console.error("[Database] saveDoctorDatabaseProfile exception:", err);
    return { success: false, error: err?.message };
  }
}
