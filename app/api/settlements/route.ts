import { NextRequest, NextResponse } from "next/server";
import { isSettlement } from "@/lib/settlements";
import { supabaseRequest } from "@/lib/supabase";
import { getSettlements } from "@/lib/settlement-store";

export async function GET() {
  try {
    return NextResponse.json(await getSettlements());
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "정산 기록을 불러오지 못했어요." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const settlement = await request.json();
    if (!isSettlement(settlement)) return NextResponse.json({ message: "정산 기록 형식이 올바르지 않아요." }, { status: 400 });
    const { id, title, note, rounds, createdAt } = settlement;
    await supabaseRequest("settlement_sessions?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ id, title, note, rounds, created_at: createdAt }),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "정산 기록을 저장하지 못했어요." }, { status: 503 });
  }
}
