import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient, verifyAdminRequest } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const admin = verifyAdminRequest(req);
  if (!admin) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in as Administrator." },
      { status: 401 }
    );
  }

  try {
    const supabaseAdmin = getSupabaseAdminClient();

    const [usersRes, userProfilesRes, healthRes, doctorProfilesRes, authUsersRes] =
      await Promise.all([
        supabaseAdmin
          .from("users")
          .select("id, email, role, status, created_at")
          .order("created_at", { ascending: false }),
        supabaseAdmin
          .from("user_profiles")
          .select("id, user_id, name, phone, dob, gender, address, profile_image, created_at")
          .order("created_at", { ascending: false }),
        supabaseAdmin
          .from("health_details")
          .select("user_id, height, weight, bp, medical_history, allergies, other_details, updated_at"),
        supabaseAdmin
          .from("doctor_profiles")
          .select("id, user_id, name, specialization, qualification, experience, registration_no, bio, availability, profile_image, verification_status, created_at")
          .order("created_at", { ascending: false }),
        supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 }).catch(() => ({ data: { users: [] } })),
      ]);

    if (doctorProfilesRes.error) {
      throw new Error(doctorProfilesRes.error.message);
    }
    if (userProfilesRes.error) {
      throw new Error(userProfilesRes.error.message);
    }

    const dbUsers = usersRes.data || [];
    const authUsers = authUsersRes?.data?.users || [];
    const userMap = new Map(dbUsers.map((u: any) => [u.id, u]));
    const authUserMap = new Map(authUsers.map((au: any) => [au.id, au]));
    const healthMap = new Map((healthRes.data || []).map((h: any) => [h.user_id, h]));

    const doctorUserIds = new Set(
      (doctorProfilesRes.data || []).map((d: any) => d.user_id).filter(Boolean)
    );

    // 1. Build User (Patients) Directory from user_profiles + users + health_details
    const seenUserIds = new Set<string>();
    const formattedUsers: any[] = [];

    (userProfilesRes.data || []).forEach((up: any) => {
      if (up.user_id) seenUserIds.add(up.user_id);
      const uRec = userMap.get(up.user_id);
      const auRec = authUserMap.get(up.user_id);
      const hd = healthMap.get(up.user_id);

      let parsedOther: any = {};
      if (hd?.other_details) {
        try {
          parsedOther =
            typeof hd.other_details === "string"
              ? JSON.parse(hd.other_details)
              : hd.other_details;
        } catch {
          parsedOther = {};
        }
      }

      formattedUsers.push({
        id: up.id,
        userId: up.user_id,
        name: up.name || auRec?.user_metadata?.name || "Registered User",
        email: uRec?.email || auRec?.email || auRec?.user_metadata?.email || "—",
        phone: up.phone || auRec?.phone || "—",
        gender: up.gender || "—",
        dob: up.dob || null,
        address: up.address || "—",
        diet: parsedOther.diet || "—",
        goals: Array.isArray(parsedOther.goals) ? parsedOther.goals : [],
        language: parsedOther.language || "English",
        medicalHistory: hd?.medical_history || "",
        bp: hd?.bp || "",
        status: uRec?.status || "active",
        createdAt: up.created_at || uRec?.created_at,
      });
    });

    // Also include any role='user' accounts in public.users that lack a user_profiles row
    dbUsers.forEach((u: any) => {
      if (
        u.role === "user" &&
        !seenUserIds.has(u.id) &&
        !doctorUserIds.has(u.id)
      ) {
        const auRec = authUserMap.get(u.id);
        formattedUsers.push({
          id: u.id,
          userId: u.id,
          name: auRec?.user_metadata?.name || u.email?.split("@")[0] || "User",
          email: u.email || "—",
          phone: auRec?.phone || "—",
          gender: "—",
          dob: null,
          address: "—",
          diet: "—",
          goals: [],
          language: "English",
          medicalHistory: "",
          bp: "",
          status: u.status || "active",
          createdAt: u.created_at,
        });
      }
    });

    // 2. Build Doctor Directory from doctor_profiles + users
    const formattedDoctors = (doctorProfilesRes.data || []).map((doc: any) => {
      const uRec = userMap.get(doc.user_id);
      const auRec = authUserMap.get(doc.user_id);
      const avail =
        typeof doc.availability === "object" && doc.availability !== null
          ? doc.availability
          : {};

      const rawStatus = doc.verification_status || "pending";
      const uiStatus =
        rawStatus === "verified"
          ? "Verified"
          : rawStatus === "rejected"
            ? "Declined"
            : "Unverified";

      return {
        id: doc.id,
        userId: doc.user_id,
        name: doc.name || "Clinician",
        email: uRec?.email || auRec?.email || auRec?.user_metadata?.email || "—",
        phone: auRec?.phone || auRec?.user_metadata?.phone || "—",
        specialization: doc.specialization || "General Medicine",
        qualification: doc.qualification || "MBBS",
        experience: doc.experience || 0,
        registrationNo: doc.registration_no || "—",
        bio: doc.bio || "",
        hospital: avail.hospital || avail.location || "Teleconsult & Clinic",
        languages: Array.isArray(avail.languages) ? avail.languages : ["English"],
        videoFee: avail.videoFee || 800,
        clinicFee: avail.clinicFee || 1000,
        verificationStatus: rawStatus, // 'pending' | 'verified' | 'rejected'
        statusLabel: uiStatus, // 'Unverified' | 'Verified' | 'Declined'
        createdAt: doc.created_at,
      };
    });

    // 3. Doctor Requests = unverified doctors awaiting review ('pending') + declined for reference
    const doctorRequests = formattedDoctors.filter(
      (d: any) => d.verificationStatus === "pending"
    );

    const verifiedDoctorsCount = formattedDoctors.filter(
      (d: any) => d.verificationStatus === "verified"
    ).length;
    const unverifiedDoctorsCount = doctorRequests.length;
    const declinedDoctorsCount = formattedDoctors.filter(
      (d: any) => d.verificationStatus === "rejected"
    ).length;

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      doctors: formattedDoctors,
      doctorRequests,
      stats: {
        totalUsers: formattedUsers.length,
        totalDoctors: formattedDoctors.length,
        verifiedDoctors: verifiedDoctorsCount,
        unverifiedDoctors: unverifiedDoctorsCount,
        declinedDoctors: declinedDoctorsCount,
      },
    });
  } catch (err: any) {
    console.error("[Admin Data API Error]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch admin data." },
      { status: 500 }
    );
  }
}

