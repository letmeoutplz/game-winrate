import { getGames } from "@/lib/game-store";
import { cumulativeWinRateTrend, winRateByParticipant } from "@/lib/stats";
import { HeadToHeadTable } from "@/components/HeadToHeadTable";
import { TrendChart } from "@/components/TrendChart";
import { PartnerRecommender } from "@/components/PartnerRecommender";
import { SettlementLedger } from "@/components/SettlementLedger";

export const dynamic = "force-dynamic";

export default async function Home() {
  const games = await getGames();
  const settledGames = games.filter((game) => game.result !== "draw" && game.includesMe !== false);
  const wins = settledGames.filter((game) => game.result === "win").length;
  const winRate = settledGames.length ? Math.round((wins / settledGames.length) * 100) : 0;
  const netAmount = games.reduce((total, game) => total + game.amount, 0);
  const participantStats = winRateByParticipant(games);
  const trend = cumulativeWinRateTrend(games);

  return (
    <div className="app-shell">
      <nav className="workspace-nav" aria-label="주요 메뉴">
        <a className="wordmark" href="#settlement-title" aria-label="내기 계산기">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="4" /><path d="M8 8h8M8 12h2m4 0h2m-8 4h2m4 0h2" /></svg>
          <span className="brand-name">내기 계산기</span>
        </a>
        <div className="workspace-links">
          <a href="#settlement-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2h-4v-8H9v8H5a2 2 0 0 1-2-2z" /></svg><span>정산</span></a>
          <a href="#insights"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 3v17h17M8 15v-4m5 4V6m5 9V9" /></svg><span>승률과 추천</span></a>
        </div>
        <span className="nav-caption">함께한 판의 기록</span>
      </nav>
      <main className="workspace-body">
      <header className="dashboard-header">
        <div>
          <h1>내기 계산기</h1>
        </div>
      </header>

      <section className="settlement-panel" aria-labelledby="settlement-title">
        <div className="section-heading compact">
          <h2 id="settlement-title">정산 장부</h2>
        </div>
        <SettlementLedger />
      </section>

      <details className="secondary-section" id="insights">
        <summary>승률과 추천</summary>
        <dl className="summary-grid" aria-label="전체 성적 요약">
          <div><dt>기원 승률</dt><dd>{winRate}%</dd></div>
          <div><dt>기원 전적</dt><dd>{wins}승 {settledGames.length - wins}패</dd></div>
          <div><dt>기원 누적 정산</dt><dd className={netAmount >= 0 ? "positive" : "negative"}>{netAmount > 0 ? "+" : ""}{netAmount.toLocaleString()}</dd></div>
        </dl>

      <section className="primary-panel" aria-labelledby="recommendation-title">
        <div className="section-heading">
          <h2 id="recommendation-title">파트너 추천</h2>
          <p>팀전에서 기원과 같은 편으로 플레이한 기록만 반영합니다.</p>
        </div>
        <PartnerRecommender games={games} />
      </section>


      <section className="analysis-grid" aria-label="상세 분석">
        <article className="analysis-card">
          <div className="section-heading compact"><h2>누적 승률 추이</h2></div>
          <TrendChart points={trend} />
        </article>
        <article className="analysis-card">
          <div className="section-heading compact"><h2>참가자별 승률</h2></div>
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
      </details>

      </main>
    </div>
  );
}
