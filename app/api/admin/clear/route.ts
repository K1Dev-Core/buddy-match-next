import { isAllowedSeniorEmail } from "@/lib/auth/senior-allowlist";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const targetSeniorId = String(body.seniorId ?? "");

    if (!targetSeniorId) {
      return NextResponse.json({ error: "Missing seniorId" }, { status: 400 });
    }

    const { error } = await supabase.rpc("clear_assignment", {
      p_senior_id: targetSeniorId
    });

    if (error) {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
