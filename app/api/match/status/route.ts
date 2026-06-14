import { getSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.rpc("get_matching_open");
    if (error) {
      return NextResponse.json({ open: false }, { status: 200 });
    }
    return NextResponse.json({ open: data === true });
  } catch {
    return NextResponse.json({ open: false }, { status: 200 });
  }
}
