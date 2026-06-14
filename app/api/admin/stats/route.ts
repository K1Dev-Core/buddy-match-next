import { isAllowedSeniorEmail } from "@/lib/auth/senior-allowlist";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAllowedSeniorEmail(user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const seniorId = user.email.replace("@msu.ac.th", "");
    const { data: adminCheck } = await supabase
      .from("seniors")
      .select("is_admin")
      .eq("id", seniorId)
      .maybeSingle();

    if (!adminCheck?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase.rpc("get_admin_stats");

    if (error) {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    return NextResponse.json(data ?? { totalSeniors: 0, assignedSeniors: 0, unassignedSeniors: 0 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
