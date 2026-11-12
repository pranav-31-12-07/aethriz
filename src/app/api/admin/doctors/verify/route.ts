import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient, verifyAdminRequest } from "@/lib/adminAuth";

export async function PATCH(req: NextRequest) {
  const admin = verifyAdminRequest(req);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Admin session required." },
      { status: 401 }
    );
  }

  try {
    const { doctorId, action } = await req.json();

    if (!doctorId || typeof doctorId !== "string") {
      return NextResponse.json(
        { success: false, error: "Valid doctorId is required." },
        { status: 400 }
      );
    }

    let nextStatus: "verified" | "rejected" | "pending";
    if (action === "accept" || action === "verify") {
      nextStatus = "verified";
    } else if (action === "decline" || action === "reject") {
      nextStatus = "rejected";
    } else if (action === "unverify" || action === "pending") {
      nextStatus = "pending";
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action. Use accept, decline, or unverify." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();

    const { data, error } = await supabaseAdmin
      .from("doctor_profiles")
      .update({ verification_status: nextStatus })
      .eq("id", doctorId)
      .select("id, user_id, name, verification_status")
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      doctor: data,
      verificationStatus: nextStatus,
    });
  } catch (err: any) {
    console.error("[Admin Verify Doctor API Error]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to update doctor status." },
      { status: 500 }
    );
  }
}

