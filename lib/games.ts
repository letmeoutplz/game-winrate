import type { Settlement } from "./settlements";

export const GAME_OPTIONS = ["모마", "롤", "마리오파티"] as const;
export const PLAYER_OPTIONS = ["기원", "일렙", "지석", "동성", "용현", "현재"] as const;

export type Game = {
  id: string;
  game: string;
  amount: number;
  date: string;
  title: string;
  completed: boolean;
  myTeam: string[];
  oppTeam: string[];
  result: "win" | "lose" | "draw";
  includesMe?: boolean;
  teamGame?: boolean;
};

export function gamesFromSettlements(settlements: Settlement[]): Game[] {
  return settlements.flatMap((session) => session.rounds.flatMap((round) => {
    const winners = Object.keys(round.amounts).filter((name) => round.amounts[name] > 0);
    const losers = Object.keys(round.amounts).filter((name) => round.amounts[name] < 0);
    if (!winners.length || !losers.length) return [];
    const amount = round.amounts["기원"] ?? 0;
    return [{
      id: `${session.id}:${round.id}`,
      game: round.game ?? "미분류",
      amount,
      date: round.date ?? (/^\d{4}-\d{2}-\d{2}$/.test(session.title) ? session.title : new Date(session.createdAt).toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" })),
      title: session.title,
      completed: true,
      myTeam: amount < 0 ? losers : winners,
      oppTeam: amount < 0 ? winners : losers,
      result: amount < 0 ? "lose" : "win",
      includesMe: amount !== 0,
      teamGame: round.teamGame ?? false,
    }];
  }));
}
