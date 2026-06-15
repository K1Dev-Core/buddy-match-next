import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sendWebhook } from "@/lib/webhook";
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

    if (data?.profile?.seniorId) {
      sendWebhook("🎲 น้องกดสุ่มพี่รหัส", [
        { name: "รหัสน้อง (4 หลัก)", value: juniorCode4, inline: true },
        { name: "รหัสน้องเต็ม", value: juniorId, inline: true },
        { name: "พี่รหัสที่สุ่มได้", value: String(data.profile.seniorId), inline: true },
        { name: "ชื่อพี่รหัส", value: String(data.profile.fullName ?? "-"), inline: true }
      ]);
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
