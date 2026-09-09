import { headToHead } from "@/lib/stats";
import { Game } from "@/lib/notion";

export function HeadToHeadTable({ games }: { games: Game[] }) {
  const { teammates, opponents, table } = headToHead(games);

  if (teammates.length === 0) {
    return <p className="text-footnote">데이터가 없습니다.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="text-sm border-collapse w-full">
        <thead>
          <tr>
            <th className="p-2 text-left text-footnote font-normal">내 팀원 \ 상대</th>
            {opponents.map((opp) => (
              <th key={opp} className="p-2 text-footnote font-medium">
                {opp}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {teammates.map((mate) => (
            <tr
              key={mate}
              style={{ borderTop: "1px solid var(--separator-non-opaque)" }}
            >
              <td
                className="p-2 font-medium text-[15px]"
                style={{ color: "var(--label-primary)" }}
              >
                {mate}
              </td>
              {opponents.map((opp) => {
                const cell = table.get(mate)?.get(opp);
                if (!cell) {
                  return (
                    <td
                      key={opp}
                      className="p-2 text-center"
                      style={{ color: "var(--label-quaternary)" }}
                    >
                      -
                    </td>
                  );
                }
                const pct = Math.round(cell.winRate * 100);
                const color =
                  cell.winRate >= 0.6
                    ? "#34c759"
                    : cell.winRate < 0.5
                      ? "#ff453a"
                      : "var(--label-primary)";
                return (
                  <td
                    key={opp}
                    className="p-2 text-center font-semibold"
                    style={{ color }}
                  >
                    {pct}%
                    <span className="block text-[10px] font-normal text-footnote">
                      {cell.wins}/{cell.games}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
