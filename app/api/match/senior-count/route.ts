import { getSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ count: 0 });
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.rpc("get_senior_count");

    if (error) {
      return NextResponse.json(
        { count: 0, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ count: data ?? 0 });
  } catch {
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
