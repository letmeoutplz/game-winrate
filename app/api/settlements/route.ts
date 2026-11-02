import { NextRequest, NextResponse } from "next/server";
import { isSettlement, Settlement } from "@/lib/settlements";
import { supabaseRequest } from "@/lib/supabase";

type Row = Omit<Settlement, "createdAt"> & { created_at: string };

function fromRow(row: Row): Settlement {
  const { created_at, ...settlement } = row;
  return { ...settlement, createdAt: created_at };
}

export async function GET() {
  try {
    const rows = await supabaseRequest("settlement_sessions?select=id,title,note,rounds,created_at&order=created_at.desc") as Row[];
    return NextResponse.json(rows.map(fromRow));
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
      headers: { Prefer: "resolution=ignore-duplicates" },
      body: JSON.stringify({ id, title, note, rounds, created_at: createdAt }),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "정산 기록을 저장하지 못했어요." }, { status: 503 });
  }
}
