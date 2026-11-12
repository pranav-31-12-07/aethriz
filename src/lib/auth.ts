export type UserRole = "patient" | "doctor" | "admin" | "nurse";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  specialty?: string;
  diet?: string;
  goals?: string[];
  language?: string;
  medicalRegNo?: string;
  hospital?: string;
  experience?: string;
  qualification?: string;
  bio?: string;
}

export const MOCK_USERS: Record<string, { user: UserProfile; password: string; redirect: string }> = {
  "patient@aethriz.com": {
    user: {
      id: "usr-pat-01",
      name: "Priyadarshini Rao",
      email: "patient@aethriz.com",
      phone: "+91 98765 43210",
      role: "patient",
      diet: "Vegetarian",
      goals: ["Blood sugar", "Heart health"],
      language: "English",
    },
    password: "patient123",
    redirect: "/dashboard",
  },
  "doctor@aethriz.com": {
    user: {
      id: "doc-ananya-01",
      name: "Dr. Ananya Rao",
      email: "doctor@aethriz.com",
      phone: "+91 98111 22334",
      role: "doctor",
      specialty: "Endocrinology & Metabolic Health",
      language: "English",
      medicalRegNo: "MCI-48291 / State Council",
      hospital: "Apollo Metabolic & Diabetes Center",
      experience: "12 years",
      qualification: "MBBS, MD (Endocrinology)",
    },
    password: "doctor123",
    redirect: "/doctor-portal",
  },
};

export function getSession(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("aethriz_session");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function saveSession(user: UserProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem("aethriz_session", JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("aethriz_session");
}
