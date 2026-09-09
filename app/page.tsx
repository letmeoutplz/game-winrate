import { getGames } from "@/lib/notion";
import { winRateByParticipant, cumulativeWinRateTrend } from "@/lib/stats";
import { TeammateBars } from "@/components/TeammateBars";
import { HeadToHeadTable } from "@/components/HeadToHeadTable";
import { TrendChart } from "@/components/TrendChart";
import { NewGameForm } from "@/components/NewGameForm";
import { PartnerRecommender } from "@/components/PartnerRecommender";

export const dynamic = "force-dynamic";

export default async function Home() {
  const games = await getGames();
  const participantStats = winRateByParticipant(games);
  const trend = cumulativeWinRateTrend(games);

  return (
    <div
      className="min-h-screen px-4 py-10 sm:px-8"
      style={{ background: "var(--bg-secondary)" }}
    >
      <div className="glass-backdrop" aria-hidden />
      <main className="max-w-2xl mx-auto space-y-6">
        <header className="px-2">
          <h1 className="text-large-title">🪙 내기 승률</h1>
          <p className="text-subtitle mt-0.5">승률 확인</p>
        </header>

        <section className="glass p-6">
          <h2 className="text-title-2 mb-4">게임별 파트너 추천</h2>
          <PartnerRecommender games={games} />
        </section>

        <section className="glass p-6">
          <h2 className="text-title-2 mb-4">참가자별 승률 (전체)</h2>
          <TeammateBars stats={participantStats} />
        </section>

        <section className="glass p-6">
          <h2 className="text-title-2 mb-4">누적 승률 추이</h2>
          <TrendChart points={trend} />
        </section>

        <section className="glass p-6">
          <h2 className="text-title-2 mb-4">카운터</h2>
          <HeadToHeadTable games={games} />
        </section>

        <section className="glass p-6">
          <h2 className="text-title-2 mb-4">새 경기 추가</h2>
          <NewGameForm />
        </section>
      </main>
    </div>
  );
}
