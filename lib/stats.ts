import { Game } from "./games";

export type TeammateStat = {
  name: string;
  games: number;
  wins: number;
  winRate: number;
  adjustedWinRate: number;
};

// 표본이 적을수록 전체 평균 쪽으로 끌어당기는 베이지안 보정.
// PRIOR_GAMES판만큼 "전체 평균 승률"의 가상 경기를 더해서 계산한다.
const PRIOR_GAMES = 3;

// 무승부는 승/패 어느 쪽도 아니므로 승률 계산(분모 포함)에서 제외한다.
function buildStats(rows: { name: string; result: Game["result"] }[]): TeammateStat[] {
  const decisive = rows.filter((r) => r.result !== "draw");
  const byName = new Map<string, { games: number; wins: number }>();
  for (const { name, result } of decisive) {
    const s = byName.get(name) ?? { games: 0, wins: 0 };
    s.games += 1;
    if (result === "win") s.wins += 1;
    byName.set(name, s);
  }

  const totalGames = decisive.length;
  const totalWins = decisive.filter((r) => r.result === "win").length;
  const globalRate = totalGames > 0 ? totalWins / totalGames : 0;

  return [...byName.entries()]
    .map(([name, s]) => ({
      name,
      games: s.games,
      wins: s.wins,
      winRate: s.wins / s.games,
      adjustedWinRate: (s.wins + PRIOR_GAMES * globalRate) / (s.games + PRIOR_GAMES),
    }))
    .sort((a, b) => b.adjustedWinRate - a.adjustedWinRate);
}

function flip(result: Game["result"]): Game["result"] {
  if (result === "win") return "lose";
  if (result === "lose") return "win";
  return "draw";
}

export function winRateByTeammate(games: Game[]): TeammateStat[] {
  const rows = games.filter((g) => g.includesMe !== false && g.teamGame !== false).flatMap((g) => g.myTeam.map((name) => ({ name, result: g.result })));
  return buildStats(rows);
}

// 나의 팀원이든 상대 팀원이든, 등장한 모든 참가자의 승률(자기 진영 기준)
export function winRateByParticipant(games: Game[]): TeammateStat[] {
  const rows = games.flatMap((g) => [
    ...g.myTeam.map((name) => ({ name, result: g.result })),
    ...g.oppTeam.map((name) => ({ name, result: flip(g.result) })),
  ]);
  return buildStats(rows);
}

export type HeadToHeadCell = { games: number; wins: number; winRate: number };

// rows = 나의 팀원, cols = 상대 팀원 (무승부 경기는 제외)
export function headToHead(games: Game[]) {
  const teammates = new Set<string>();
  const opponents = new Set<string>();
  const table = new Map<string, Map<string, HeadToHeadCell>>();

  for (const g of games) {
    if (g.result === "draw" || g.includesMe === false || g.teamGame === false) continue;
    for (const mate of g.myTeam) {
      teammates.add(mate);
      for (const opp of g.oppTeam) {
        opponents.add(opp);
        if (!table.has(mate)) table.set(mate, new Map());
        const row = table.get(mate)!;
        const cell = row.get(opp) ?? { games: 0, wins: 0, winRate: 0 };
        cell.games += 1;
        if (g.result === "win") cell.wins += 1;
        cell.winRate = cell.wins / cell.games;
        row.set(opp, cell);
      }
    }
  }

  return {
    teammates: [...teammates].sort(),
    opponents: [...opponents].sort(),
    table,
  };
}

export type TrendPoint = { date: string; cumulativeWinRate: number; index: number };

// 무승부 경기는 승률 추이 계산에서 제외(집계에서 스킵)
export function cumulativeWinRateTrend(games: Game[]): TrendPoint[] {
  const decisive = [...games]
    .filter((g) => g.result !== "draw" && g.includesMe !== false)
    .sort((a, b) => a.date.localeCompare(b.date));
  let wins = 0;
  return decisive.map((g, i) => {
    if (g.result === "win") wins += 1;
    return { date: g.date, cumulativeWinRate: wins / (i + 1), index: i + 1 };
  });
}
