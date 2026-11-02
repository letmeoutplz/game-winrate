import { TeammateStat } from "@/lib/stats";

export function TeammateBars({ stats }: { stats: TeammateStat[] }) {
  return (
    <div className="partner-list">
      {stats.map((stat) => (
        <div className="partner-row" key={stat.name}>
          <span>{stat.name}</span>
          <div className="partner-track" aria-label={`${stat.name} 보정 승률 ${Math.round(stat.adjustedWinRate * 100)}%`}><div style={{ width: `${Math.max(stat.adjustedWinRate * 100, 8)}%` }} /></div>
          <strong>{Math.round(stat.adjustedWinRate * 100)}%</strong>
          <small>{stat.games}판</small>
        </div>
      ))}
    </div>
  );
}
