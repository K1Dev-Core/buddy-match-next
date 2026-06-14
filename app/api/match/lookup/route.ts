import { getSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const juniorId = request.nextUrl.searchParams.get("juniorId");

  if (!juniorId) {
    return NextResponse.json(null, { status: 400 });
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.rpc("lookup_junior_assignment", {
      p_junior_id: juniorId
    });

    if (error) {
      return NextResponse.json(null, { status: 500 });
    }

    return NextResponse.json(data ?? null);
  } catch {
    return NextResponse.json(null, { status: 500 });
  }
}
