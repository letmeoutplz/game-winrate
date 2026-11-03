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
      <nav className="workspace-nav" aria-label="주요 메뉴">
        <a className="wordmark" href="#settlement-title">내기 계산기</a>
        <div className="workspace-links"><a href="#settlement-title">정산</a><a href="#insights">승률과 추천</a><a href="#game-record">경기 기록</a></div>
        <span className="nav-caption">함께한 판의 기록</span>
      </nav>
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
          <div><dt>승률</dt><dd>{winRate}%</dd></div>
          <div><dt>전적</dt><dd>{wins}승 {settledGames.length - wins}패</dd></div>
          <div><dt>기존 경기 정산</dt><dd className={netAmount >= 0 ? "positive" : "negative"}>{netAmount > 0 ? "+" : ""}{netAmount.toLocaleString()}</dd></div>
        </dl>


      <section className="primary-panel" aria-labelledby="recommendation-title">
        <div className="section-heading">
          <h2 id="recommendation-title">파트너 추천</h2>
          <p>같은 편으로 플레이한 기록만 반영해 추천합니다.</p>
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

      <details className="secondary-section" id="game-record">
        <summary>경기 기록 추가</summary>
        <section className="record-panel" aria-label="경기 기록 추가">
          <NewGameForm />
        </section>
      </details>
    </main>
  );
}
