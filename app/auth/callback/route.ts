import { isAllowedSeniorEmail } from "@/lib/auth/senior-allowlist";
import { getSupabaseServerClient } from "@/lib/supabase/server";
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

  return NextResponse.redirect(new URL(nextPath, origin));
}
