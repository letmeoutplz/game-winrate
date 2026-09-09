import { NextRequest, NextResponse } from "next/server";
import { addGame } from "@/lib/notion";

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    await addGame(body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "저장에 실패했어요.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
