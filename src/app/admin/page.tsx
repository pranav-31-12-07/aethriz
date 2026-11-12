"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ShieldAlert,
  Lock,
  LogOut,
  Users,
  Stethoscope,
  UserCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Eye,
  EyeOff,
  Clock,
  Phone,
  Mail,
  MapPin,
  BadgeCheck,
  AlertCircle,
} from "lucide-react";
import BioNeuralCanvas from "@/components/landing/BioNeuralCanvas";
import FloatingNavbar from "@/components/navigation/FloatingNavbar";
import Footer from "@/components/navigation/Footer";
import AethrizLogo from "@/components/ui/AethrizLogo/AethrizLogo";
import { useAuth } from "@/context/AuthContext";
import { saveSession, clearSession } from "@/lib/auth";

interface AdminUserItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  dob: string | null;
  address: string;
  diet: string;
  goals: string[];
  language: string;
  medicalHistory: string;
  bp: string;
  status: string;
  createdAt: string | null;
}

interface AdminDoctorItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  qualification: string;
  experience: number;
  registrationNo: string;
  bio: string;
  hospital: string;
  languages: string[];
  videoFee: number;
  clinicFee: number;
  verificationStatus: "pending" | "verified" | "rejected";
  statusLabel: "Unverified" | "Verified" | "Declined";
  createdAt: string | null;
}

interface AdminStats {
  totalUsers: number;
  totalDoctors: number;
  verifiedDoctors: number;
  unverifiedDoctors: number;
  declinedDoctors: number;
}

type SectionTab = "all" | "users" | "doctors" | "requests";
type DoctorFilter = "all" | "verified" | "pending" | "rejected";

export default function AdminDashboardPage() {
  const { logout } = useAuth();

  // Admin auth gate state
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminEmailDisplay, setAdminEmailDisplay] = useState("aethriz.ai@gmail.com");

  // Login form state (NO sign up for admins)
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Live DB data state
  const [usersList, setUsersList] = useState<AdminUserItem[]>([]);
  const [doctorsList, setDoctorsList] = useState<AdminDoctorItem[]>([]);
  const [doctorRequests, setDoctorRequests] = useState<AdminDoctorItem[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalDoctors: 0,
    verifiedDoctors: 0,
    unverifiedDoctors: 0,
    declinedDoctors: 0,
  });

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [busyDoctorId, setBusyDoctorId] = useState<string | null>(null);

  // Navigation & filtering
  const [activeTab, setActiveTab] = useState<SectionTab>("all");
  const [doctorFilter, setDoctorFilter] = useState<DoctorFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAdminData = useCallback(async () => {
    setIsLoadingData(true);
    setDataError("");
    try {
      const res = await fetch("/api/admin/data", { cache: "no-store" });
      if (res.status === 401) {
        setIsAdminAuthenticated(false);
        return;
      }
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to fetch live database records.");
      }
      setUsersList(json.users || []);
      setDoctorsList(json.doctors || []);
      setDoctorRequests(json.doctorRequests || []);
      setStats(
        json.stats || {
          totalUsers: (json.users || []).length,
          totalDoctors: (json.doctors || []).length,
          verifiedDoctors: 0,
          unverifiedDoctors: (json.doctorRequests || []).length,
          declinedDoctors: 0,
        }
      );
    } catch (err: any) {
      setDataError(err?.message || "Database synchronization error.");
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function verifySession() {
      setIsCheckingAuth(true);
      try {
        const res = await fetch("/api/auth/admin-login", { method: "GET", cache: "no-store" });
        const json = await res.json();
        if (!active) return;
        if (res.ok && json.authenticated && json.user) {
          setIsAdminAuthenticated(true);
          setAdminEmailDisplay(json.user.email || "aethriz.ai@gmail.com");
          saveSession({
            id: json.user.id,
            name: json.user.name,
            email: json.user.email,
            role: "admin",
          });
          await fetchAdminData();
        } else {
          setIsAdminAuthenticated(false);
        }
      } catch {
        if (active) setIsAdminAuthenticated(false);
      } finally {
        if (active) setIsCheckingAuth(false);
      }
    }
    verifySession();
    return () => {
      active = false;
    };
  }, [fetchAdminData]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!loginEmail.trim() || !loginPassword) {
      setLoginError("Please enter both administrator email and password.");
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail.trim().toLowerCase(),
          password: loginPassword,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setLoginError(json.error || "Invalid administrator credentials.");
        setLoginLoading(false);
        return;
      }

      const adminUser = {
        id: json.user.id,
        name: json.user.name,
        email: json.user.email,
        role: "admin" as const,
      };
      saveSession(adminUser);
      try {
        localStorage.setItem(
          "aethriz_auth_user",
          JSON.stringify({
            id: adminUser.id,
            email: adminUser.email,
            fullName: adminUser.name,
            role: "admin",
          })
        );
        window.dispatchEvent(new Event("aethriz-session-change"));
      } catch {
        // storage error
      }

      setAdminEmailDisplay(adminUser.email);
      setIsAdminAuthenticated(true);
      setLoginPassword("");
      await fetchAdminData();
    } catch {
      setLoginError("Unable to reach administrator authentication service.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await fetch("/api/auth/admin-login", { method: "DELETE" });
    } catch {
      // ignore
    }
    clearSession();
    await logout();
    setIsAdminAuthenticated(false);
    setUsersList([]);
    setDoctorsList([]);
    setDoctorRequests([]);
  };

  const handleDoctorVerification = async (
    doctor: AdminDoctorItem,
    action: "accept" | "decline" | "unverify"
  ) => {
    setBusyDoctorId(doctor.id);
    setActionMessage(null);
    try {
      const res = await fetch("/api/admin/doctors/verify", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId: doctor.id, action }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update doctor verification status.");
      }

      const verb =
        action === "accept"
          ? "verified and approved for patient discovery"
          : action === "decline"
          ? "declined"
          : "marked as Unverified";

      setActionMessage({
        type: "success",
        text: `${doctor.name} has been ${verb}.`,
      });
      await fetchAdminData();
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err?.message || "Unable to update verification status.",
      });
    } finally {
      setBusyDoctorId(null);
    }
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredUsers = useMemo(() => {
    if (!normalizedQuery) return usersList;
    return usersList.filter(
      (u) =>
        u.name.toLowerCase().includes(normalizedQuery) ||
        u.email.toLowerCase().includes(normalizedQuery) ||
        u.phone.toLowerCase().includes(normalizedQuery) ||
        u.address.toLowerCase().includes(normalizedQuery)
    );
  }, [usersList, normalizedQuery]);

  const filteredDoctors = useMemo(() => {
    return doctorsList.filter((d) => {
      if (doctorFilter !== "all" && d.verificationStatus !== doctorFilter) {
        return false;
      }
      if (!normalizedQuery) return true;
      return (
        d.name.toLowerCase().includes(normalizedQuery) ||
        d.email.toLowerCase().includes(normalizedQuery) ||
        d.specialization.toLowerCase().includes(normalizedQuery) ||
        d.registrationNo.toLowerCase().includes(normalizedQuery) ||
        d.qualification.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [doctorsList, doctorFilter, normalizedQuery]);

  const filteredRequests = useMemo(() => {
    if (!normalizedQuery) return doctorRequests;
    return doctorRequests.filter(
      (d) =>
        d.name.toLowerCase().includes(normalizedQuery) ||
        d.email.toLowerCase().includes(normalizedQuery) ||
        d.specialization.toLowerCase().includes(normalizedQuery) ||
        d.registrationNo.toLowerCase().includes(normalizedQuery)
    );
  }, [doctorRequests, normalizedQuery]);

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  return (
    <div className="relative min-h-screen bio-grid-canvas flex flex-col overflow-x-hidden">
      <BioNeuralCanvas />
      <FloatingNavbar />

      <main className="relative z-10 flex-grow pt-32 sm:pt-36 lg:pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto space-y-8">
        {isCheckingAuth ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-3 min-h-[260px]">
            <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
            <p className="text-sm font-medium text-slate-600">
              Verifying administrator governance session...
            </p>
          </div>
        ) : !isAdminAuthenticated ? (
          /* ================= ADMIN LOGIN GATE (NO SIGN UP) ================= */
          <div className="max-w-md mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-red-100 shadow-xl shadow-red-500/5 space-y-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <AethrizLogo variant="symbol" size="md" />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold tracking-wide">
                <ShieldAlert className="w-3.5 h-3.5" /> RESTRICTED ADMIN PORTAL
              </div>
              <h1
                className="text-2xl sm:text-3xl font-bold text-[#1D1F22] tracking-tight"
                style={{ fontFamily: "'Inter Tight', sans-serif" }}
              >
                Admin Panel Sign In
              </h1>
              <p className="text-xs sm:text-sm text-[#4A4E54]">
                Enter the authorized platform administrator credentials to inspect database
                records and verify doctor requests.
              </p>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Administrator Email
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="aethriz.ai@gmail.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-indigo-500 focus:outline-none text-sm text-[#1D1F22] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter administrator password"
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-indigo-500 focus:outline-none text-sm text-[#1D1F22] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-xl bg-[#0B0E14] hover:bg-[#1D1F22] text-white font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>{loginLoading ? "Authenticating..." : "Access Admin Panel"}</span>
              </button>
            </form>

            <div className="pt-3 border-t border-slate-100 text-center">
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                Administrator Sign-Up Disabled · Pre-Provisioned Access Only
              </p>
            </div>
          </div>
        ) : (
          /* ================= AUTHENTICATED ADMIN DASHBOARD ================= */
          <>
            {/* Governance Header Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-red-100 shadow-xl shadow-red-500/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold tracking-wide">
                  <ShieldAlert className="w-3.5 h-3.5" /> CLINICAL &amp; PLATFORM GOVERNANCE
                </div>
                <h1
                  className="text-3xl sm:text-4xl font-bold text-[#1D1F22] tracking-tight"
                  style={{ fontFamily: "'Inter Tight', sans-serif" }}
                >
                  AETHRIZ Admin Control Center
                </h1>
                <p className="text-[#4A4E54] text-sm sm:text-base">
                  Signed in as <span className="font-semibold text-[#1D1F22]">{adminEmailDisplay}</span>{" "}
                  · Live Supabase Directory &amp; Doctor Verification Gate
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-mono font-bold text-slate-700">
                    ADMIN ACCESS GRANTED
                  </span>
                </div>
                <button
                  type="button"
                  onClick={fetchAdminData}
                  disabled={isLoadingData}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingData ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={handleAdminLogout}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-semibold transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>

            {/* 4 Dark HUD Telemetry Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0B0E14] text-white p-5 rounded-2xl border border-white/10 space-y-1">
                <div className="text-[11px] font-mono text-white/50 flex items-center justify-between">
                  <span>1. REGISTERED USERS</span>
                  <Users className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <div className="text-xs text-sky-400">Patients in user_profiles &amp; users</div>
              </div>

              <div className="bg-[#0B0E14] text-white p-5 rounded-2xl border border-white/10 space-y-1">
                <div className="text-[11px] font-mono text-white/50 flex items-center justify-between">
                  <span>2. REGISTERED DOCTORS</span>
                  <Stethoscope className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-bold">{stats.totalDoctors}</div>
                <div className="text-xs text-indigo-300">
                  {stats.declinedDoctors} Declined · Total clinicians
                </div>
              </div>

              <div className="bg-[#0B0E14] text-white p-5 rounded-2xl border border-white/10 space-y-1">
                <div className="text-[11px] font-mono text-white/50 flex items-center justify-between">
                  <span>VERIFIED DOCTORS</span>
                  <BadgeCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold">{stats.verifiedDoctors}</div>
                <div className="text-xs text-emerald-400">Visible to users with Verified mark</div>
              </div>

              <div className="bg-[#0B0E14] text-white p-5 rounded-2xl border border-white/10 space-y-1">
                <div className="text-[11px] font-mono text-white/50 flex items-center justify-between">
                  <span>3. DOCTOR REQUESTS</span>
                  <UserCheck className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold">{stats.unverifiedDoctors}</div>
                <div className="text-xs text-amber-400">Unverified · Awaiting Accept / Decline</div>
              </div>
            </div>

            {/* Feedback Banner */}
            {(actionMessage || dataError) && (
              <div
                className={`rounded-2xl p-4 border flex items-center justify-between gap-3 text-sm font-medium ${
                  dataError || actionMessage?.type === "error"
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-emerald-50 border-emerald-200 text-emerald-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  {dataError || actionMessage?.type === "error" ? (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{dataError || actionMessage?.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActionMessage(null);
                    setDataError("");
                  }}
                  className="text-xs font-bold underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Section Selector Tabs + Search Filter */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    { id: "all", label: "All Sections" },
                    { id: "users", label: `1. User (${stats.totalUsers})` },
                    { id: "doctors", label: `2. Doctor (${stats.totalDoctors})` },
                    {
                      id: "requests",
                      label: `3. Doctor Requests (${stats.unverifiedDoctors})`,
                    },
                  ] as const
                ).map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? "bg-[#0B0E14] text-white shadow-sm"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      <span>{tab.label}</span>
                      {tab.id === "requests" && stats.unverifiedDoctors > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full lg:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, email, specialty, reg no..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400 focus:outline-none text-xs text-[#1D1F22]"
                />
              </div>
            </div>

            {/* ================= SECTION 1: USER ================= */}
            {(activeTab === "all" || activeTab === "users") && (
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#1D1F22]">1. User Directory</h2>
                      <p className="text-xs text-[#4A4E54]">
                        Patient accounts fetched live from user_profiles, users &amp; health_details
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold">
                    {filteredUsers.length} {filteredUsers.length === 1 ? "USER" : "USERS"}
                  </span>
                </div>

                {isLoadingData && usersList.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">
                    Loading users from database...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center text-sm text-slate-500">
                    No registered users found matching your query.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredUsers.map((u) => (
                      <div
                        key={u.id}
                        className="p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/40 hover:bg-white transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center font-bold text-lg shrink-0">
                            {u.name
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase() || "U"}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-[#1D1F22] text-base">{u.name}</h3>
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase">
                                {u.status || "active"}
                              </span>
                              {u.gender && u.gender !== "—" && (
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                                  {u.gender}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#4A4E54]">
                              <span className="inline-flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                {u.email}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                {u.phone}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {u.address}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-slate-500">
                              <span>Joined: {formatDate(u.createdAt)}</span>
                              {u.diet && u.diet !== "—" && <span>· Diet: {u.diet}</span>}
                              {u.goals.length > 0 && (
                                <span>· Goals: {u.goals.slice(0, 3).join(", ")}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                            Patient Account
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ================= SECTION 2: DOCTOR ================= */}
            {(activeTab === "all" || activeTab === "doctors") && (
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#1D1F22]">2. Doctor Directory</h2>
                      <p className="text-xs text-[#4A4E54]">
                        All registered clinicians from doctor_profiles &amp; their verification state
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {(
                      [
                        { id: "all", label: "All" },
                        { id: "verified", label: "Verified" },
                        { id: "pending", label: "Unverified" },
                        { id: "rejected", label: "Declined" },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setDoctorFilter(f.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                          doctorFilter === f.id
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {isLoadingData && doctorsList.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">
                    Loading doctors from database...
                  </div>
                ) : filteredDoctors.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center text-sm text-slate-500">
                    No doctors found in this view.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredDoctors.map((doc) => {
                      const isBusy = busyDoctorId === doc.id;
                      const isVerified = doc.verificationStatus === "verified";
                      const isDeclined = doc.verificationStatus === "rejected";
                      return (
                        <div
                          key={doc.id}
                          className="p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/40 hover:bg-white transition-all"
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 border ${
                                isVerified
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : isDeclined
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {doc.name
                                .replace(/^Dr\.?\s*/i, "")
                                .split(" ")
                                .filter(Boolean)
                                .map((w) => w[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase() || "DR"}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-[#1D1F22] text-base">{doc.name}</h3>
                                {isVerified ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                                    <BadgeCheck className="w-3.5 h-3.5" /> Verified
                                  </span>
                                ) : isDeclined ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold">
                                    <XCircle className="w-3.5 h-3.5" /> Declined
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                                    <Clock className="w-3.5 h-3.5" /> Unverified
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-[#4A4E54]">
                                {doc.specialization} · {doc.qualification} · {doc.experience} yrs exp
                                {" · "}
                                {doc.hospital}
                              </p>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1">
                                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                                  {doc.email}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                                  {doc.phone}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 pt-1">
                                <span>Reg No: {doc.registrationNo}</span>
                                <span>•</span>
                                <span>
                                  Fees: ₹{doc.videoFee} Video / ₹{doc.clinicFee} Clinic
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 flex-wrap">
                            {doc.verificationStatus === "pending" ? (
                              <>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleDoctorVerification(doc, "accept")}
                                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-1 disabled:opacity-60 cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{isBusy ? "Updating..." : "Accept"}</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleDoctorVerification(doc, "decline")}
                                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-red-50 text-slate-700 hover:text-red-600 font-semibold text-xs transition-colors flex items-center gap-1 disabled:opacity-60 cursor-pointer"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Decline</span>
                                </button>
                              </>
                            ) : doc.verificationStatus === "verified" ? (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleDoctorVerification(doc, "unverify")}
                                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-amber-50 text-slate-700 hover:text-amber-700 font-semibold text-xs transition-colors disabled:opacity-60 cursor-pointer"
                              >
                                {isBusy ? "Updating..." : "Mark Unverified"}
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleDoctorVerification(doc, "accept")}
                                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-1 disabled:opacity-60 cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{isBusy ? "Updating..." : "Accept & Verify"}</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleDoctorVerification(doc, "unverify")}
                                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-amber-50 text-slate-700 hover:text-amber-700 font-semibold text-xs transition-colors disabled:opacity-60 cursor-pointer"
                                >
                                  Move to Requests
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* ================= SECTION 3: DOCTOR REQUESTS ================= */}
            {(activeTab === "all" || activeTab === "requests") && (
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#1D1F22]">
                        3. Doctor Requests (Unverified Queue)
                      </h2>
                      <p className="text-xs text-[#4A4E54]">
                        New doctor sign-ups are marked Unverified automatically. Accept to publish
                        with a Verified mark or Decline registration.
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-bold">
                    {filteredRequests.length} PENDING
                  </span>
                </div>

                {isLoadingData && doctorRequests.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">
                    Checking pending doctor verification requests...
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center space-y-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                    <p className="text-sm font-semibold text-[#1D1F22]">
                      All Doctor Requests Processed
                    </p>
                    <p className="text-xs text-slate-500">
                      No unverified doctors are waiting for approval right now. New doctor
                      registrations will appear here automatically.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRequests.map((doc) => {
                      const isBusy = busyDoctorId === doc.id;
                      return (
                        <div
                          key={doc.id}
                          className="p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/40 hover:bg-white transition-all"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E3202B] flex items-center justify-center font-bold text-lg shrink-0">
                              {doc.name
                                .replace(/^Dr\.?\s*/i, "")
                                .split(" ")
                                .filter(Boolean)
                                .map((w) => w[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase() || "DR"}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-[#1D1F22] text-base">{doc.name}</h3>
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase tracking-wide">
                                  Unverified · New Request
                                </span>
                              </div>
                              <p className="text-xs text-[#4A4E54]">
                                {doc.specialization} · {doc.qualification} · {doc.experience} yrs exp
                              </p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1">
                                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                                  {doc.email}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                                  {doc.phone}
                                </span>
                              </div>
                              {doc.bio && (
                                <p className="text-xs text-slate-600 line-clamp-2 pt-0.5">{doc.bio}</p>
                              )}
                              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 pt-1">
                                <span>Reg No: {doc.registrationNo}</span>
                                <span>•</span>
                                <span>Requested: {formatDate(doc.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleDoctorVerification(doc, "accept")}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-1 disabled:opacity-60 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{isBusy ? "Processing..." : "Accept"}</span>
                            </button>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleDoctorVerification(doc, "decline")}
                              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-red-50 text-slate-700 hover:text-red-600 font-semibold text-xs transition-colors flex items-center gap-1 disabled:opacity-60 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Decline</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
