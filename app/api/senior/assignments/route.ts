import { isAllowedSeniorEmail } from "@/lib/auth/senior-allowlist";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json({ assignments: [] }, { status: 401 });
    }

    if (!(await isAllowedSeniorEmail(user.email, supabase))) {
      return NextResponse.json({ assignments: [] }, { status: 403 });
    }

    const seniorId = user.email.replace("@msu.ac.th", "");

    const { data } = await supabase
      .from("assignments")
      .select("junior_id, junior_code4, assigned_at")
      .eq("senior_id", seniorId)
      .order("assigned_at", { ascending: false });

    return NextResponse.json({ assignments: data ?? [] });
  } catch {
    return NextResponse.json({ assignments: [] }, { status: 500 });
  }
}
