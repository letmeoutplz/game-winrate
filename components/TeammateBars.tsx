import { TeammateStat } from "@/lib/stats";

export function TeammateBars({ stats }: { stats: TeammateStat[] }) {
  return (
    <div className="space-y-4">
      {stats.map((s) => (
        <div key={s.name} className="flex items-center gap-3">
          <div
            className="w-14 shrink-0 text-[15px] font-medium"
            style={{ color: "var(--label-primary)" }}
          >
            {s.name}
          </div>
          <div className="track flex-1 h-7 rounded-full overflow-hidden">
            <div
              className="track-fill h-full w-full flex items-center justify-end pr-3 rounded-full"
              style={{
                transform: `scaleX(${Math.max(s.adjustedWinRate, 0.1)})`,
                background: "var(--win)",
              }}
            >
              <span
                className="text-[12px] font-semibold"
                style={{
                  color: "var(--bg-primary)",
                  transform: `scaleX(${1 / Math.max(s.adjustedWinRate, 0.1)})`,
                }}
              >
                {Math.round(s.adjustedWinRate * 100)}%
              </span>
            </div>
          </div>
          <div className="w-24 shrink-0 text-footnote text-right">
            실승률 {Math.round(s.winRate * 100)}% · {s.wins}승 {s.games - s.wins}패
          </div>
        </div>
      ))}
      {stats.length === 0 && <p className="text-footnote">데이터가 없습니다.</p>}
    </div>
  );
}
