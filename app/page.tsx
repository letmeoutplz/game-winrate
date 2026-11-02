import { getGames } from "@/lib/notion";
import { cumulativeWinRateTrend, winRateByParticipant } from "@/lib/stats";
import { HeadToHeadTable } from "@/components/HeadToHeadTable";
import { TrendChart } from "@/components/TrendChart";
import { NewGameForm } from "@/components/NewGameForm";
import { PartnerRecommender } from "@/components/PartnerRecommender";
import { SettlementLedger } from "@/components/SettlementLedger";

export const dynamic = "force-dynamic";

export default async function Home() {
  const games = await getGames();
  const settledGames = games.filter((game) => game.result !== "draw");
  const wins = settledGames.filter((game) => game.result === "win").length;
  const winRate = settledGames.length ? Math.round((wins / settledGames.length) * 100) : 0;
  const netAmount = games.reduce((total, game) => total + game.amount, 0);
  const participantStats = winRateByParticipant(games);
  const trend = cumulativeWinRateTrend(games);

  return (
    <main className="app-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">GAME NIGHT LEDGER</p>
          <h1>내기 계산기</h1>
          <p className="header-copy">기록은 간단하게, 다음 조합은 더 자신 있게.</p>
        </div>
        <dl className="summary-grid" aria-label="전체 성적 요약">
          <div><dt>승률</dt><dd>{winRate}%</dd></div>
          <div><dt>전적</dt><dd>{wins}승 {settledGames.length - wins}패</dd></div>
          <div><dt>기존 경기 정산</dt><dd className={netAmount >= 0 ? "positive" : "negative"}>{netAmount > 0 ? "+" : ""}{netAmount.toLocaleString()}</dd></div>
        </dl>
      </header>

      <section className="settlement-panel" aria-labelledby="settlement-title">
        <div className="section-heading compact">
          <div><p className="eyebrow">SETTLEMENT LEDGER</p><h2 id="settlement-title">정산 장부</h2></div>
          <p>한 판씩 기록하고, 모임이 끝나면 함께 정산하세요.</p>
        </div>
        <SettlementLedger />
      </section>


      <section className="primary-panel" aria-labelledby="recommendation-title">
        <div className="section-heading">
          <div><p className="eyebrow">NEXT PICK</p><h2 id="recommendation-title">이번 판, 누구와 할까?</h2></div>
          <p>같은 편으로 플레이한 기록만 반영해 추천합니다.</p>
        </div>
        <PartnerRecommender games={games} />
      </section>

      <section className="record-panel" aria-labelledby="record-title">
        <div className="section-heading compact">
          <div><p className="eyebrow">ADD A RESULT</p><h2 id="record-title">방금 한 게임 기록하기</h2></div>
          <p>금액은 이기면 양수, 지면 음수로 입력하세요.</p>
        </div>
        <NewGameForm />
      </section>


      <section className="analysis-grid" aria-label="상세 분석">
        <article className="analysis-card">
          <div className="section-heading compact"><div><p className="eyebrow">MOMENTUM</p><h2>누적 승률 추이</h2></div></div>
          <TrendChart points={trend} />
        </article>
        <article className="analysis-card">
          <div className="section-heading compact"><div><p className="eyebrow">ALL PLAYERS</p><h2>참가자별 승률</h2></div></div>
          <div className="participant-list">
            {participantStats.map((stat) => <div className="participant-row" key={stat.name}><span>{stat.name}</span><strong>{Math.round(stat.winRate * 100)}%</strong><small>{stat.wins}승 {stat.games - stat.wins}패</small></div>)}
            {participantStats.length === 0 && <p className="empty-state">아직 기록이 없어요.</p>}
          </div>
        </article>
      </section>

      <details className="matchup-details">
        <summary>상성표 보기 <span>내 팀원 × 상대 팀원</span></summary>
        <div className="matchup-content"><HeadToHeadTable games={games} /></div>
      </details>
    </main>
  );
}
