import { NextResponse } from "next/server";
import { supabaseRequest } from "@/lib/supabase";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ message: "잘못된 기록 ID예요." }, { status: 400 });
  try {
    await supabaseRequest(`settlement_sessions?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "정산 기록을 삭제하지 못했어요." }, { status: 503 });
  }
}
