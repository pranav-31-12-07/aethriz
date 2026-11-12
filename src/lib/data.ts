import { supabase } from "@/lib/supabase";

export interface PlatformStats {
  activePatientsCount: number;
  verifiedDoctorsCount: number;
  totalConsultationsCount: number;
  completedConsultationsCount: number;
  publishedArticlesCount: number;
}

export interface DoctorRecord {
  id: string;
  userId: string;
  name: string;
  specialty: string;
  qualification: string;
  experience: number;
  registrationNo: string;
  bio: string;
  rating: number;
  reviewCount: number;
  languages: string[];
  location: string;
  consultFee: number;
  clinicFee: number;
  hasVideo: boolean;
  hasClinic: boolean;
  verificationStatus: string;
  profileImage?: string | null;
}

export interface AppointmentRecord {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  type: "online" | "offline";
  notes?: string | null;
  createdAt: string;
}

export interface ArticleRecord {
  id: string;
  doctorId: string;
  authorName: string;
  authorRole: string;
  title: string;
  content: string;
  category: string;
  status: string;
  coverImage?: string | null;
  createdAt: string;
  readTime: string;
}

export interface PatientCohortRecord {
  id: string;
  userId: string;
  name: string;
  phone: string;
  gender: string;
  dob?: string | null;
  diet?: string;
  goals: string[];
  language: string;
  ageGroup?: string;
  sleepHours?: number;
  height?: number | null;
  weight?: number | null;
  bp?: string | null;
  medicalHistory?: string | null;
  allergies?: string | null;
  updatedAt?: string | null;
}

/**
 * 1. Fetch dynamic platform aggregated stats from Supabase
 */
export async function fetchPlatformStats(): Promise<PlatformStats> {
  try {
    const [ptsRes, docsRes, aptsRes, cmplRes, artsRes] = await Promise.all([
      supabase.from("user_profiles").select("*", { count: "exact", head: true }),
      supabase.from("doctor_profiles").select("*", { count: "exact", head: true }).eq("verification_status", "verified"),
      supabase.from("appointments").select("*", { count: "exact", head: true }),
      supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "completed"),
      supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "published"),
    ]);

    return {
      activePatientsCount: ptsRes.count || 0,
      verifiedDoctorsCount: docsRes.count || 0,
      totalConsultationsCount: aptsRes.count || 0,
      completedConsultationsCount: cmplRes.count || 0,
      publishedArticlesCount: artsRes.count || 0,
    };
  } catch (err) {
    console.warn("[Data] fetchPlatformStats error:", err);
    return {
      activePatientsCount: 0,
      verifiedDoctorsCount: 0,
      totalConsultationsCount: 0,
      completedConsultationsCount: 0,
      publishedArticlesCount: 0,
    };
  }
}

/**
 * Fetch doctor portal stats
 */
export async function fetchDoctorPortalStats(doctorUserId?: string): Promise<{
  activePatients: number;
  todayConsults: number;
  reportsToSignOff: number;
  aiInsightsReady: number;
}> {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let appointmentsQuery = supabase
      .from("appointments")
      .select("*", { count: "exact", head: true });
    let todayConsultsQuery = supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .gte("appointment_date", todayStart.toISOString());

    if (doctorUserId) {
      try {
        const { data: docData } = await supabase
          .from("doctor_profiles")
          .select("id, user_id")
          .or(`id.eq.${doctorUserId},user_id.eq.${doctorUserId}`)
          .maybeSingle();

        const idFilters = [doctorUserId];
        if (docData?.id && !idFilters.includes(docData.id)) idFilters.push(docData.id);
        if (docData?.user_id && !idFilters.includes(docData.user_id)) idFilters.push(docData.user_id);

        const orClause = idFilters.map((id) => `doctor_id.eq.${id}`).join(",");
        appointmentsQuery = appointmentsQuery.or(orClause);
        todayConsultsQuery = todayConsultsQuery.or(orClause);
      } catch {
        appointmentsQuery = appointmentsQuery.or(`doctor_id.eq.${doctorUserId}`);
        todayConsultsQuery = todayConsultsQuery.or(`doctor_id.eq.${doctorUserId}`);
      }
    }

    const [patientsCount, consultsRes, todayRes, reportsRes] = await Promise.all([
      supabase.from("user_profiles").select("*", { count: "exact", head: true }),
      appointmentsQuery,
      todayConsultsQuery,
      supabase.from("health_details").select("*", { count: "exact", head: true }),
    ]);

    const totalConsultsForDoc = consultsRes.count || 0;
    const todayConsultsCount = todayRes.count || (totalConsultsForDoc > 0 ? totalConsultsForDoc : 0);

    return {
      activePatients: patientsCount.count || 0,
      todayConsults: todayConsultsCount,
      reportsToSignOff: reportsRes.count || 0,
      aiInsightsReady: reportsRes.count ? Math.ceil(reportsRes.count / 2) : 0,
    };
  } catch (err) {
    console.warn("[Data] fetchDoctorPortalStats error:", err);
    return {
      activePatients: 0,
      todayConsults: 0,
      reportsToSignOff: 0,
      aiInsightsReady: 0,
    };
  }
}

export function formatDoctorRecord(doc: any): DoctorRecord {
  const avail = typeof doc.availability === "object" && doc.availability !== null ? doc.availability : {};
  const langs = Array.isArray(avail.languages) ? avail.languages : ["English", "हिन्दी"];

  return {
    id: doc.id,
    userId: doc.user_id,
    name: doc.name || "Specialist",
    specialty: doc.specialization || "General Medicine",
    qualification: doc.qualification || "MBBS",
    experience: doc.experience || 0,
    registrationNo: doc.registration_no || "",
    bio: doc.bio || "",
    rating: 4.9,
    reviewCount: 0,
    languages: langs,
    location: avail.location || avail.hospital || "Teleconsult & Clinic",
    consultFee: avail.videoFee || 800,
    clinicFee: avail.clinicFee || 1000,
    hasVideo: true,
    hasClinic: Boolean(avail.clinicFee || avail.hospital),
    verificationStatus: doc.verification_status || "pending",
    profileImage: doc.profile_image || null,
  };
}

/**
 * 2. Fetch doctors dynamically from Supabase doctor_profiles
 * Returns real doctors from DB. If no doctors exist in DB, returns empty array.
 */
export async function fetchDoctors(options?: {
  specialty?: string;
  verifiedOnly?: boolean;
}): Promise<DoctorRecord[]> {
  try {
    let query = supabase
      .from("doctor_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (options?.specialty && options.specialty !== "All") {
      query = query.ilike("specialization", `%${options.specialty}%`);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      if (error) console.warn("[Data] fetchDoctors error:", error);
      return [];
    }

    const records = data.map(formatDoctorRecord);

    // If verifiedOnly is requested, return strictly verified doctors
    if (options?.verifiedOnly) {
      return records.filter((doc) => doc.verificationStatus === "verified");
    }

    return records.filter((doc) => doc.verificationStatus !== "rejected");
  } catch (err) {
    console.warn("[Data] fetchDoctors exception:", err);
    return [];
  }
}

/**
 * Fetch a single doctor dynamically from Supabase by id or user_id
 */
export async function fetchDoctorById(idOrUserId: string): Promise<DoctorRecord | null> {
  if (!idOrUserId || !idOrUserId.trim()) return null;
  const cleanId = idOrUserId.trim();

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);

    if (isUuid) {
      const { data, error } = await supabase
        .from("doctor_profiles")
        .select("*")
        .or(`id.eq.${cleanId},user_id.eq.${cleanId}`)
        .maybeSingle();

      if (!error && data) return formatDoctorRecord(data);
    } else {
      // Query by id or user_id for text IDs
      const { data, error } = await supabase
        .from("doctor_profiles")
        .select("*")
        .eq("id", cleanId)
        .maybeSingle();

      if (!error && data) return formatDoctorRecord(data);

      const fallback = await supabase
        .from("doctor_profiles")
        .select("*")
        .eq("user_id", cleanId)
        .maybeSingle();

      if (!fallback.error && fallback.data) return formatDoctorRecord(fallback.data);
    }

    return null;
  } catch (err) {
    console.warn("[Data] fetchDoctorById exception:", err);
    return null;
  }
}

/**
 * 3. Fetch appointments from Supabase
 */
export async function fetchAppointments(options?: {
  userId?: string;
  role?: "doctor" | "patient";
  status?: string;
}): Promise<AppointmentRecord[]> {
  try {
    let query = supabase.from("appointments").select("*").order("appointment_date", { ascending: true });

    if (options?.status && options.status !== "All") {
      query = query.eq("status", options.status.toLowerCase());
    }

    if (options?.userId) {
      if (options.role === "patient") {
        query = query.eq("patient_id", options.userId);
      } else if (options.role === "doctor") {
        try {
          const { data: docData } = await supabase
            .from("doctor_profiles")
            .select("id, user_id")
            .or(`id.eq.${options.userId},user_id.eq.${options.userId}`)
            .maybeSingle();

          const idFilters = [options.userId];
          if (docData?.id && !idFilters.includes(docData.id)) idFilters.push(docData.id);
          if (docData?.user_id && !idFilters.includes(docData.user_id)) idFilters.push(docData.user_id);

          const orClause = idFilters.map((id) => `doctor_id.eq.${id}`).join(",");
          query = query.or(orClause);
        } catch {
          query = query.eq("doctor_id", options.userId);
        }
      } else {
        query = query.or(`patient_id.eq.${options.userId},doctor_id.eq.${options.userId}`);
      }
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) return [];

    // Extract unique patient and doctor IDs
    const patientIds = Array.from(new Set(data.map((a: any) => a.patient_id).filter(Boolean)));
    const doctorIds = Array.from(new Set(data.map((a: any) => a.doctor_id).filter(Boolean)));

    const [patientsRes, doctorsRes] = await Promise.all([
      patientIds.length > 0 ? supabase.from("user_profiles").select("user_id, name, phone").in("user_id", patientIds) : { data: [] },
      doctorIds.length > 0 ? supabase.from("doctor_profiles").select("id, user_id, name, specialization").or(`id.in.(${doctorIds.join(",")}),user_id.in.(${doctorIds.join(",")})`) : { data: [] },
    ]);

    const patientMap = new Map((patientsRes.data || []).map((p: any) => [p.user_id, p]));
    const doctorMap = new Map();
    (doctorsRes.data || []).forEach((d: any) => {
      if (d.id) doctorMap.set(d.id, d);
      if (d.user_id) doctorMap.set(d.user_id, d);
    });

    return data.map((apt: any) => {
      const patient = patientMap.get(apt.patient_id) || {};
      const doctor = doctorMap.get(apt.doctor_id) || {};

      return {
        id: apt.id,
        patientId: apt.patient_id,
        doctorId: apt.doctor_id,
        patientName: patient.name || "Patient",
        patientPhone: patient.phone || "—",
        doctorName: doctor.name || "Doctor",
        doctorSpecialty: doctor.specialization || "Clinical Consultation",
        appointmentDate: apt.appointment_date,
        status: apt.status || "confirmed",
        type: apt.type || "online",
        notes: apt.notes,
        createdAt: apt.created_at,
      };
    });
  } catch (err) {
    console.warn("[Data] fetchAppointments error:", err);
    return [];
  }
}

/**
 * 4. Book an appointment in Supabase
 */
export async function bookAppointment(payload: {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  type: "online" | "offline";
  notes?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabase.from("appointments").insert({
      patient_id: payload.patientId,
      doctor_id: payload.doctorId,
      appointment_date: payload.appointmentDate,
      status: "confirmed",
      type: payload.type,
      notes: payload.notes || "",
    }).select().single();

    if (error) {
      console.warn("[Data] bookAppointment error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("[Data] bookAppointment exception:", err);
    return { success: false, error: err?.message };
  }
}

/**
 * 5. Fetch articles from Supabase
 */
export async function fetchArticles(options?: {
  category?: string;
  status?: string;
}): Promise<ArticleRecord[]> {
  try {
    let query = supabase.from("articles").select("*").order("created_at", { ascending: false });

    if (options?.status) {
      query = query.eq("status", options.status);
    } else {
      query = query.eq("status", "published");
    }

    if (options?.category && options.category !== "All") {
      query = query.ilike("category", `%${options.category}%`);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) return [];

    const doctorIds = Array.from(new Set(data.map((a: any) => a.doctor_id).filter(Boolean)));
    const { data: doctors } = doctorIds.length > 0
      ? await supabase.from("doctor_profiles").select("id, name, specialization").in("id", doctorIds)
      : { data: [] };

    const docMap = new Map((doctors || []).map((d: any) => [d.id, d]));

    return data.map((art: any) => {
      const doc = docMap.get(art.doctor_id);
      const wordCount = (art.content || "").split(/\s+/).length;
      const readMin = Math.max(1, Math.ceil(wordCount / 180));

      return {
        id: art.id,
        doctorId: art.doctor_id,
        authorName: doc?.name || "AETHRIZ Clinical Team",
        authorRole: doc?.specialization || "Medical Review Board",
        title: art.title,
        content: art.content,
        category: art.category || "General health",
        status: art.status || "published",
        coverImage: art.cover_image || null,
        createdAt: art.created_at,
        readTime: `${readMin} min`,
      };
    });
  } catch (err) {
    console.warn("[Data] fetchArticles error:", err);
    return [];
  }
}

/**
 * 6. Fetch patient cohort for doctor views
 */
export async function fetchDoctorPatients(): Promise<PatientCohortRecord[]> {
  try {
    const { data: profiles, error: pErr } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (pErr || !profiles || profiles.length === 0) return [];

    const userIds = profiles.map((p: any) => p.user_id).filter(Boolean);
    const { data: healthList } = userIds.length > 0
      ? await supabase.from("health_details").select("*").in("user_id", userIds)
      : { data: [] };

    const healthMap = new Map((healthList || []).map((h: any) => [h.user_id, h]));

    return profiles.map((p: any) => {
      const h = healthMap.get(p.user_id);
      let details: any = {};
      if (h?.other_details) {
        try {
          details = JSON.parse(h.other_details);
        } catch {
          // ignore parsing error
        }
      }

      return {
        id: p.id,
        userId: p.user_id,
        name: p.name || "Patient",
        phone: p.phone || "—",
        gender: p.gender || details.gender || "—",
        dob: p.dob || null,
        diet: details.diet || "—",
        goals: Array.isArray(details.goals) ? details.goals : [],
        language: details.language || "English",
        ageGroup: details.ageGroup || "—",
        sleepHours: details.sleepHours || 7,
        height: h?.height || null,
        weight: h?.weight || null,
        bp: h?.bp || null,
        medicalHistory: h?.medical_history || null,
        allergies: h?.allergies || null,
        updatedAt: h?.updated_at || p.created_at,
      };
    });
  } catch (err) {
    console.warn("[Data] fetchDoctorPatients error:", err);
    return [];
  }
}

/**
 * 7. Fetch single patient's health details
 */
export async function fetchPatientHealthDetails(userId: string) {
  try {
    const [profileRes, healthRes] = await Promise.all([
      supabase.from("user_profiles").select("*").eq("user_id", userId).single(),
      supabase.from("health_details").select("*").eq("user_id", userId).single(),
    ]);

    let otherDetails: any = {};
    if (healthRes.data?.other_details) {
      try {
        otherDetails = JSON.parse(healthRes.data.other_details);
      } catch {
        // ignore
      }
    }

    return {
      profile: profileRes.data || null,
      health: healthRes.data || null,
      parsedDetails: otherDetails,
    };
  } catch (err) {
    console.warn("[Data] fetchPatientHealthDetails error:", err);
    return { profile: null, health: null, parsedDetails: {} };
  }
}
