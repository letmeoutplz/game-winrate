import { Game, gamesFromSettlements } from "./games";
import { getSettlements } from "./settlement-store";
import { supabaseRows } from "./supabase";

type HistoryRow = Omit<Game, "myTeam" | "oppTeam" | "result"> & { my_team: string[]; opp_team: string[] };

export async function getGames(): Promise<Game[]> {
  const [history, settlements] = await Promise.all([
    supabaseRows<HistoryRow>("game_history?select=*&order=date.asc,id.asc"),
    getSettlements(),
  ]);
  return [
    ...history.map(({ my_team, opp_team, ...row }): Game => ({ ...row, date: row.date ?? "", myTeam: my_team, oppTeam: opp_team, result: row.amount > 0 ? "win" : row.amount < 0 ? "lose" : "draw" })),
    ...gamesFromSettlements(settlements),
  ];
}
