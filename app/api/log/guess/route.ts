import { sendWebhook } from "@/lib/webhook";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const juniorId = String(body.juniorId ?? "");
  const seniorId = String(body.seniorId ?? "");
  const seniorName = String(body.seniorName ?? "");

  sendWebhook("🎯 น้องตอบชื่อพี่รหัสถูกต้อง", [
    { name: "รหัสน้อง", value: juniorId, inline: true },
    { name: "พี่รหัส", value: seniorId, inline: true },
    { name: "ชื่อพี่รหัส", value: seniorName, inline: true }
  ]);

  return NextResponse.json({ ok: true });
}
