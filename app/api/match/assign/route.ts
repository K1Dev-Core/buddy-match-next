import { getSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const juniorId = String(body.juniorId ?? "");
  const juniorCode4 = String(body.juniorCode4 ?? "");

  if (!juniorId || !juniorCode4) {
    return NextResponse.json(
      { message: "Missing junior identity", status: "invalid" },
      { status: 400 }
    );
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.rpc("assign_senior_to_junior", {
      p_junior_code4: juniorCode4,
      p_junior_id: juniorId
    });

    if (error) {
      return NextResponse.json(
        { message: error.message, status: "rpc_error" },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? null);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Server match failed",
        status: "server_error"
      },
      { status: 500 }
    );
  }
}
