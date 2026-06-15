import { isAllowedSeniorEmail } from "@/lib/auth/senior-allowlist";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sendWebhook } from "@/lib/webhook";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.rpc("get_matching_open");
    return NextResponse.json({ open: error ? false : data === true });
  } catch {
    return NextResponse.json({ open: false }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!isAllowedSeniorEmail(user.email)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const seniorId = user.email.replace("@msu.ac.th", "");
    const { data: adminCheck } = await supabase
      .from("seniors")
      .select("is_admin")
      .eq("id", seniorId)
      .maybeSingle();

    if (!adminCheck?.is_admin) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const open = body.open === true;

    const { error } = await supabase.rpc("set_matching_open", { p_open: open });
    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    sendWebhook(open ? "🟢 แอดมินเปิดระบบสุ่ม" : "🔴 แอดมินปิดระบบสุ่ม", [
      { name: "แอดมิน", value: seniorId, inline: true },
      { name: "สถานะ", value: open ? "เปิด" : "ปิด", inline: true }
    ], open ? 0x2ecc71 : 0xe74c3c);

    return NextResponse.json({ status: "ok", open });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
