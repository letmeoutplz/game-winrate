import type { Settlement } from "./settlements";
import { supabaseRows } from "./supabase";

type Row = Omit<Settlement, "createdAt"> & { created_at: string };

export async function getSettlements(): Promise<Settlement[]> {
  const rows = await supabaseRows<Row>("settlement_sessions?select=id,title,note,rounds,created_at&order=created_at.desc,id.asc");
  return rows.map(({ created_at, ...session }) => ({ ...session, createdAt: created_at }));
}
