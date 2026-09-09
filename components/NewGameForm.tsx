"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { GAME_OPTIONS, PLAYER_OPTIONS } from "@/lib/notion";

export function NewGameForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [game, setGame] = useState<string>(GAME_OPTIONS[0]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState("");
  const [myTeam, setMyTeam] = useState<string[]>([]);
  const [oppTeam, setOppTeam] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggle = (set: (v: string[]) => void, list: string[], name: string) => {
    set(list.includes(name) ? list.filter((n) => n !== name) : [...list, name]);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game,
          amount: Number(amount),
          date,
          title,
          myTeam,
          oppTeam,
          completed: true,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `저장 실패 (${res.status})`);
      }
      setAmount("");
      setTitle("");
      setMyTeam([]);
      setOppTeam([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했어요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex gap-3 flex-wrap">
        <label className="flex flex-col gap-1 text-footnote">
          게임
          <select
            value={game}
            onChange={(e) => setGame(e.target.value)}
            className="field"
          >
            {GAME_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-footnote">
          날짜
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="field"
          />
        </label>
        <label className="flex flex-col gap-1 text-footnote">
          금액 (승=+, 패=-)
          <input
            type="number"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="field w-32"
          />
        </label>
        <label className="flex flex-col gap-1 flex-1 min-w-40 text-footnote">
          정산내역(제목)
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="field"
          />
        </label>
      </div>

      <div>
        <div className="text-footnote mb-2">나의 팀원</div>
        <div className="flex gap-2 flex-wrap">
          {PLAYER_OPTIONS.map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => toggle(setMyTeam, myTeam, p)}
              className={`chip ${myTeam.includes(p) ? "chip-selected" : ""}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-footnote mb-2">상대 팀원</div>
        <div className="flex gap-2 flex-wrap">
          {PLAYER_OPTIONS.map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => toggle(setOppTeam, oppTeam, p)}
              className={`chip ${oppTeam.includes(p) ? "chip-selected" : ""}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-footnote" style={{ color: "#ff453a" }}>
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting} className="btn-prominent">
        {submitting ? "저장 중..." : "노션에 추가"}
      </button>
    </form>
  );
}
