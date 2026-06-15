import { isAllowedSeniorEmail } from "@/lib/auth/senior-allowlist";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sendWebhook } from "@/lib/webhook";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!(await isAllowedSeniorEmail(user.email, supabase))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const adminId = user.email.replace("@msu.ac.th", "");
    const { data: adminCheck } = await supabase
      .from("seniors")
      .select("is_admin")
      .eq("id", adminId)
      .maybeSingle();
    if (!adminCheck?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const targetId = String(body.seniorId ?? "").trim();
    const setAdmin = body.admin === true;

    if (!targetId) {
      return NextResponse.json({ error: "Missing seniorId" }, { status: 400 });
    }

    const { error } = await supabase.rpc("set_senior_admin", {
      p_id: targetId,
      p_admin: setAdmin,
    });

    if (error) {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    sendWebhook(setAdmin ? "👑 ตั้งเป็นแอดมิน" : "🚫 ถอดแอดมิน", [
      { name: "แอดมิน", value: adminId, inline: true },
      { name: "รุ่นพี่", value: targetId, inline: true },
      { name: "สถานะ", value: setAdmin ? "เป็นแอดมิน" : "ไม่เป็นแอดมิน", inline: true },
    ], setAdmin ? 0x2ecc71 : 0xe74c3c);

    return NextResponse.json({ status: "ok", isAdmin: setAdmin });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
