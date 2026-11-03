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

  const toggleMyTeam = (name: string) => {
    toggle(setMyTeam, myTeam, name);
    setOppTeam((team) => team.filter((player) => player !== name));
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
    <form onSubmit={handleSubmit} className="record-form">
      <div className="record-fields">
        <label>
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
        <label>
          날짜
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="field"
          />
        </label>
        <label>
          정산 금액
          <input
            type="number"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="field"
          />
        </label>
        <label>
          한 줄 메모
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="field"
          />
        </label>
      </div>

      <fieldset className="team-picker">
        <legend>내 팀</legend>
        <div>
          {PLAYER_OPTIONS.map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => toggleMyTeam(p)}
              className={`chip ${myTeam.includes(p) ? "chip-selected" : ""}`}
            >
              {p}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="team-picker">
        <legend>상대 팀</legend>
        <div>
          {PLAYER_OPTIONS.map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => toggle(setOppTeam, oppTeam, p)}
              disabled={myTeam.includes(p)}
              className={`chip ${oppTeam.includes(p) ? "chip-selected" : ""}`}
            >
              {p}
            </button>
          ))}
        </div>
      </fieldset>

      {error && (
        <p className="text-footnote" style={{ color: "#ff453a" }}>
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting} className="save-button">
        {submitting ? "저장 중…" : "경기 저장"}
      </button>
    </form>
  );
}
