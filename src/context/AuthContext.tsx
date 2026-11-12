"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContextType, UserProfile, UserRole } from "@/types/auth";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const MOCK_PROFILES: Record<UserRole, UserProfile> = {
  patient: {
    id: "usr-pat-1049",
    email: "marcus.vance@gmail.com",
    fullName: "Marcus Vance",
    role: "patient",
    department: "Cardiometabolic Care Cohort",
  },
  doctor: {
    id: "usr-doc-8942",
    email: "sarah.lin@stanford.edu",
    fullName: "Dr. Sarah Lin, MD, FACC",
    role: "doctor",
    department: "Cardiovascular Medicine",
    licenseNo: "NPI-1849204918",
  },
  nurse: {
    id: "usr-nur-3301",
    email: "ananya.sharma@aethriz.com",
    fullName: "Ananya Sharma, RN, BSN",
    role: "nurse",
    department: "Clinical Triage & Telemetry",
    licenseNo: "MCI-RN-884210",
  },
  admin: {
    id: "usr-adm-0001",
    email: "secops@aethriz.com",
    fullName: "Aethriz SecOps Admin",
    role: "admin",
    department: "Platform Governance & Compliance",
  },
};

export function getRoleRedirectPath(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "doctor":
      return "/doctor-portal";
    case "nurse":
      return "/nurse-queue";
    case "patient":
    default:
      return "/dashboard";
  }
}

export function detectRoleFromCredentials(email: string): UserRole {
  const clean = (email || "").trim().toLowerCase();

  // 1. Check if user is in registered profiles storage
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("aethriz_registered_users");
      if (stored) {
        const users = JSON.parse(stored);
        const match = users.find((u: any) => (u.email || "").toLowerCase() === clean);
        if (match && match.role) return match.role as UserRole;
      }
    }
  } catch {
    // storage error
  }

  // 2. Intelligent clinical domain & credential pattern matching
  if (
    clean.includes("doctor") ||
    clean.includes("dr.") ||
    clean.includes("sarah.lin") ||
    clean.includes("stanford.edu") ||
    clean.includes("aiims.edu") ||
    clean.includes("oxford.ac.uk") ||
    clean.includes("apollo") ||
    clean.includes("cardio") ||
    clean.includes("physician")
  ) {
    return "doctor";
  }

  if (
    clean.includes("nurse") ||
    clean.includes("ananya") ||
    clean.includes("triage") ||
    clean.includes("icu") ||
    clean.includes("staff")
  ) {
    return "nurse";
  }

  if (
    clean.includes("admin") ||
    clean.includes("secops") ||
    clean.includes("governance") ||
    clean.includes("compliance") ||
    clean.includes("root@")
  ) {
    return "admin";
  }

  // 3. Default to patient member
  return "patient";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const syncLocalSession = async () => {
      try {
        const res = await fetch("/api/auth/admin-login", { method: "GET" });
        if (res.ok) {
          const adminJson = await res.json();
          if (adminJson.authenticated && adminJson.user) {
            setUser({
              id: adminJson.user.id,
              email: adminJson.user.email,
              fullName: adminJson.user.name,
              role: "admin",
              department: "Platform Governance & Compliance",
            });
            return true;
          }
        }
      } catch {
        // ignore admin check failure
      }

      try {
        const rawSession = localStorage.getItem("aethriz_session");
        if (rawSession) {
          const parsed = JSON.parse(rawSession);
          if (parsed?.email && parsed?.role !== "admin") {
            setUser({
              id: parsed.id || "usr-session",
              email: parsed.email,
              fullName: parsed.name || parsed.email.split("@")[0],
              role: parsed.role as UserRole,
            });
            return true;
          }
        }
        const stored = localStorage.getItem("aethriz_auth_user");
        if (stored) {
          setUser(JSON.parse(stored));
          return true;
        }
      } catch {
        // storage error
      }
      return false;
    };

    // 1. If Supabase is active, listen to session changes
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetchSupabaseProfile(session.user.id, session.user.email || "");
        } else {
          syncLocalSession();
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          fetchSupabaseProfile(session.user.id, session.user.email || "");
        } else {
          syncLocalSession().then((hasLocal) => {
            if (!hasLocal) setUser(null);
          });
        }
      });

      const handleSessionEvent = () => {
        syncLocalSession();
      };
      window.addEventListener("aethriz-session-change", handleSessionEvent);

      return () => {
        subscription.unsubscribe();
        window.removeEventListener("aethriz-session-change", handleSessionEvent);
      };
    }

    // 2. Fallback to local storage persistence
    syncLocalSession();
    const handleSessionEvent = () => {
      syncLocalSession();
    };
    window.addEventListener("aethriz-session-change", handleSessionEvent);
    return () => {
      window.removeEventListener("aethriz-session-change", handleSessionEvent);
    };
  }, []);

  const fetchSupabaseProfile = async (userId: string, email: string) => {
    if (!supabase) return;
    try {
      const [{ data: docProfile }, { data: userProfile }, { data: dbUser }] = await Promise.all([
        supabase
          .from("doctor_profiles")
          .select("id, name, specialization, license_number")
          .or(`user_id.eq.${userId},id.eq.${userId}`)
          .maybeSingle(),
        supabase
          .from("user_profiles")
          .select("id, full_name")
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("users")
          .select("role")
          .eq("id", userId)
          .maybeSingle(),
      ]);

      const resolvedRole: UserRole =
        docProfile || dbUser?.role === "doctor"
          ? "doctor"
          : dbUser?.role === "admin"
          ? "admin"
          : "patient";

      const resolvedName =
        docProfile?.name ||
        userProfile?.full_name ||
        email.split("@")[0] ||
        "User";

      setUser({
        id: userId,
        email,
        fullName: resolvedName,
        role: resolvedRole,
        department: docProfile?.specialization || undefined,
        licenseNo: docProfile?.license_number || undefined,
      });
    } catch (err) {
      console.warn("Could not fetch Supabase profile", err);
    }
  };

  const loginWithSupabase = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) {
      return { success: false, error: "Supabase credentials not configured in .env.local" };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) {
      return { success: false, error: error.message };
    }
    if (data.user) {
      await fetchSupabaseProfile(data.user.id, data.user.email || email);
      return { success: true };
    }
    return { success: false, error: "Authentication failed" };
  };

  const login = (role: UserRole, email?: string) => {
    const profile = { ...MOCK_PROFILES[role] };
    if (email) profile.email = email;
    setUser(profile);
    try {
      localStorage.setItem("aethriz_auth_user", JSON.stringify(profile));
    } catch {
      // storage unavailable
    }
  };

  const registerUser = (profile: UserProfile) => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("aethriz_registered_users");
        const list = stored ? JSON.parse(stored) : [];
        const filtered = list.filter((u: any) => u.email.toLowerCase() !== profile.email.toLowerCase());
        filtered.push(profile);
        localStorage.setItem("aethriz_registered_users", JSON.stringify(filtered));
        localStorage.setItem("aethriz_auth_user", JSON.stringify(profile));
      }
    } catch {
      // storage unavailable
    }
    setUser(profile);
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    try {
      await fetch("/api/auth/admin-login", { method: "DELETE" });
    } catch {
      // ignore
    }
    setUser(null);
    try {
      localStorage.removeItem("aethriz_auth_user");
      localStorage.removeItem("aethriz_session");
      window.dispatchEvent(new Event("aethriz-session-change"));
    } catch {
      // storage unavailable
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isSupabaseActive: isSupabaseConfigured,
        login,
        loginWithSupabase,
        logout,
        getRoleRedirectPath,
        detectRoleFromCredentials,
        registerUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
