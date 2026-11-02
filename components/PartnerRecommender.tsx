"use client";

import { useMemo, useState } from "react";
import { Game, GAME_OPTIONS } from "@/lib/notion";
import { winRateByTeammate } from "@/lib/stats";
import { TeammateBars } from "./TeammateBars";

export function PartnerRecommender({ games }: { games: Game[] }) {
  const [selected, setSelected] = useState<string>("전체");
  const stats = useMemo(() => {
    const filtered = selected === "전체" ? games : games.filter((game) => game.game === selected);
    return winRateByTeammate(filtered).filter((stat) => stat.name !== "기원");
  }, [games, selected]);
  const best = stats[0];

  return (
    <div className="recommendation-content">
      <div className="game-filter" aria-label="게임 선택">
        {["전체", ...GAME_OPTIONS].map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setSelected(g)}
            className={selected === g ? "filter-active" : "filter-button"}
          >
            {g}
          </button>
        ))}
      </div>

      {best ? (
        <div className="best-pick">
          <p>가장 잘 맞는 파트너</p>
          <div><strong>{best.name}</strong><span>보정 승률 {Math.round(best.adjustedWinRate * 100)}%</span></div>
          <small>{selected === "전체" ? "전체 게임" : selected}에서 {best.wins}승 {best.games - best.wins}패 · 실승률 {Math.round(best.winRate * 100)}%</small>
        </div>
      ) : (
        <p className="empty-state">이 게임으로 같이 한 기록이 아직 없어요.</p>
      )}

      {stats.length > 0 && <TeammateBars stats={stats} />}
    </div>
  );
}
