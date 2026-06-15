import { isAllowedSeniorEmail } from "@/lib/auth/senior-allowlist";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sendWebhook } from "@/lib/webhook";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const nextPath = requestUrl.searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(
      new URL("/?auth=missing_code", origin)
    );
  }

  const supabase = await getSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !user?.email) {
    return NextResponse.redirect(
      new URL("/?auth=exchange_failed", origin)
    );
  }

  const email = user.email;

  if (!(await isAllowedSeniorEmail(email, supabase))) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL("/?auth=unauthorized", origin)
    );
  }

  const seniorId = email.replace("@msu.ac.th", "");

  await supabase.rpc("upsert_senior_profile", {
    p_id: seniorId,
    p_full_name: user.user_metadata?.full_name ?? seniorId,
    p_contact: "",
    p_hints: [],
    p_greeting: ""
  });

  sendWebhook("🔐 รุ่นพี่เข้าสู่ระบบ", [
    { name: "รหัสรุ่นพี่", value: seniorId, inline: true },
    { name: "ชื่อ", value: user.user_metadata?.full_name ?? seniorId, inline: true }
  ]);

  return NextResponse.redirect(new URL(nextPath, origin));
}
