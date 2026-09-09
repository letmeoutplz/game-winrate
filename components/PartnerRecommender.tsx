"use client";

import { useMemo, useState } from "react";
import { Game, GAME_OPTIONS } from "@/lib/notion";
import { winRateByTeammate } from "@/lib/stats";
import { TeammateBars } from "./TeammateBars";

export function PartnerRecommender({ games }: { games: Game[] }) {
  const [selected, setSelected] = useState<string>("전체");

  const filtered = useMemo(
    () => (selected === "전체" ? games : games.filter((g) => g.game === selected)),
    [games, selected]
  );
  const stats = useMemo(
    () => winRateByTeammate(filtered).filter((s) => s.name !== "기원"),
    [filtered]
  );
  const best = stats[0];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {["전체", ...GAME_OPTIONS].map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setSelected(g)}
            className={`chip ${selected === g ? "chip-selected" : ""}`}
          >
            {g}
          </button>
        ))}
      </div>

      {best ? (
        <p className="text-subtitle">
          {selected === "전체" ? "전체 게임" : selected} 기준, 지금까지{" "}
          <b style={{ color: "var(--label-primary)" }}>{best.name}</b>와 팀했을 때
          승률이 가장 좋아요 (보정 {Math.round(best.adjustedWinRate * 100)}%, 실승률{" "}
          {Math.round(best.winRate * 100)}%, {best.wins}승 {best.games - best.wins}패)
        </p>
      ) : (
        <p className="text-footnote">이 게임으로 같이 한 기록이 아직 없어요.</p>
      )}

      <TeammateBars stats={stats} />
    </div>
  );
}
