import { TrendPoint } from "@/lib/stats";

export function TrendChart({ points }: { points: TrendPoint[] }) {
  if (points.length < 2) {
    return (
      <p className="text-footnote">추이를 그리려면 게임이 2개 이상 필요합니다.</p>
    );
  }

  const w = 600;
  const h = 160;
  const pad = 20;

  const xFor = (i: number) => pad + (i / (points.length - 1)) * (w - pad * 2);
  const yFor = (rate: number) => h - pad - rate * (h - pad * 2);

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(p.cumulativeWinRate)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="trend-chart" role="img" aria-label="경기별 누적 승률 추이">
      <line
        x1={pad}
        y1={yFor(0.5)}
        x2={w - pad}
        y2={yFor(0.5)}
        stroke="var(--separator-opaque)"
        strokeDasharray="4 4"
      />
      <path d={path} fill="none" stroke="var(--win)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={xFor(i)} cy={yFor(p.cumulativeWinRate)} r={3} fill="var(--win)" />
      ))}
      <text x={pad} y={yFor(0.5) - 6} fill="var(--label-tertiary)" fontSize={10}>
        50%
      </text>
    </svg>
  );
}
