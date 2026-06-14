import { isAllowedSeniorEmail } from "@/lib/auth/senior-allowlist";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_IDS = new Set([
  "67011212055",
  "68011212010",
  "68011212008",
  "68011212212",
  "68011212050",
  "68011212243",
]);

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
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL("/?auth=exchange_failed", origin)
    );
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const email = user?.email ?? "";

  if (!email || !isAllowedSeniorEmail(email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL("/?auth=unauthorized", origin)
    );
  }

  const seniorId = email.replace("@msu.ac.th", "");
  const isAdmin = ADMIN_IDS.has(seniorId);

  await supabase.rpc("upsert_senior_profile", {
    p_id: seniorId,
    p_full_name: user?.user_metadata?.full_name ?? seniorId,
    p_contact: "",
    p_hints: [],
    p_greeting: ""
  });

  if (isAdmin) {
    await supabase.rpc("set_senior_admin", { p_id: seniorId, p_admin: true });
  }

  return NextResponse.redirect(new URL(nextPath, origin));
}
