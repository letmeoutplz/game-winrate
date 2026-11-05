"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GAME_OPTIONS, PLAYER_OPTIONS } from "@/lib/games";
import { Amounts, Round, Settlement } from "@/lib/settlements";

type ActiveSession = { id?: string; title: string; rounds: Round[] };

const STORAGE_KEY = "game-winrate-settlements";
const ACTIVE_KEY = "game-winrate-active-settlement";
const emptySession: ActiveSession = { title: "", rounds: [] };

function today() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function totalAmounts(rounds: Round[]) {
  return rounds.reduce<Amounts>((total, round) => {
    for (const [player, amount] of Object.entries(round.amounts)) total[player] = (total[player] ?? 0) + amount;
    return total;
  }, {});
}

export function SettlementLedger() {
  const router = useRouter();
  const [game, setGame] = useState<string>(GAME_OPTIONS[0]);
  const [teamGame, setTeamGame] = useState(false);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [session, setSession] = useState<ActiveSession>(emptySession);
  const [stake, setStake] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [losers, setLosers] = useState<string[]>([]);
  const [newMember, setNewMember] = useState("");
  const [memberOptions, setMemberOptions] = useState<string[]>([...PLAYER_OPTIONS]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(async () => {
      let legacy: Settlement[] = [];
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Array<Settlement & { amounts?: Amounts }>;
          legacy = parsed.map((item) => ({ ...item, rounds: item.rounds ?? (item.amounts ? [{ id: item.id, amounts: item.amounts }] : []) }));
        }
        const active = window.localStorage.getItem(ACTIVE_KEY);
        if (active) {
          const parsed = JSON.parse(active) as ActiveSession;
          setSession({ ...parsed, title: /^\d{4}-\d{2}-\d{2}$/.test(parsed.title) ? parsed.title : today() });
        } else {
          setSession({ ...emptySession, title: today() });
        }
      } catch {
        setError("브라우저 기록을 읽지 못했어요. 기존 기록은 유지됩니다.");
      }

      try {
        for (const settlement of legacy) {
          const response = await fetch("/api/settlements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settlement) });
          if (!response.ok) throw new Error((await response.json()).message);
        }
        const response = await fetch("/api/settlements");
        if (!response.ok) throw new Error((await response.json()).message);
        setSettlements(await response.json());
        if (legacy.length > 0) {
          window.localStorage.removeItem(STORAGE_KEY);
          router.refresh();
        }
      } catch {
        setSettlements(legacy);
        setError("저장된 기록을 불러오지 못했어요. 새로고침해 주세요.");
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [router]);

  const roundAmounts = useMemo(() => {
    const amount = Number(stake) || 0;
    const winners = participants.filter((player) => !losers.includes(player));
    return Object.fromEntries(participants.map((player) => [player, losers.includes(player) ? -(winners.length * amount) : losers.length * amount]));
  }, [losers, participants, stake]);
  const runningTotals = totalAmounts(session.rounds);

  function persistSession(next: ActiveSession) {
    setSession(next);
    window.localStorage.setItem(ACTIVE_KEY, JSON.stringify(next));
  }

  function toggleParticipant(player: string) {
    setParticipants((current) => current.includes(player) ? current.filter((name) => name !== player) : [...current, player]);
    setLosers((current) => current.filter((name) => name !== player));
  }

  function toggleLoser(player: string) {
    setLosers((current) => current.includes(player) ? current.filter((name) => name !== player) : [...current, player]);
  }

  function addMember() {
    const name = newMember.trim();
    if (!name) return;
    if (!memberOptions.includes(name)) setMemberOptions((current) => [...current, name]);
    if (!participants.includes(name)) setParticipants((current) => [...current, name]);
    setNewMember("");
  }

  function addRound(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session.title) return setError("날짜를 선택해 주세요.");
    if (participants.length < 2) return setError("참가 멤버를 두 명 이상 선택해 주세요.");
    if (!Number.isFinite(Number(stake)) || Number(stake) <= 0) return setError("판돈을 0원보다 큰 금액으로 입력해 주세요.");
    if (losers.length === 0 || losers.length === participants.length) return setError("진 사람과 이긴 사람이 모두 있어야 정산할 수 있어요.");

    persistSession({ ...session, rounds: [...session.rounds, { id: crypto.randomUUID(), game, teamGame, date: session.title, amounts: roundAmounts }] });
    setLosers([]);
    setError(null);
  }

  async function finishSession() {
    if (session.rounds.length === 0) return setError("최소 한 판을 기록한 뒤 최종 저장할 수 있어요.");
    const id = session.id ?? crypto.randomUUID();
    persistSession({ ...session, id });
    const settlement: Settlement = { ...session, note: "", id, createdAt: new Date().toISOString() };
    setSaving(true);
    try {
      const response = await fetch("/api/settlements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settlement) });
      if (!response.ok) throw new Error((await response.json()).message);
      setSettlements([settlement, ...settlements]);
      window.localStorage.removeItem(ACTIVE_KEY);
      setSession({ ...emptySession, title: today() });
      setError(null);
      router.refresh();
    } catch {
      setError("저장하지 못했어요. 진행 중 기록은 유지되니 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteSettlement(id: string, title: string) {
    if (!window.confirm(`"${title}" 기록을 삭제할까요?`)) return;
    try {
      const response = await fetch(`/api/settlements/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error((await response.json()).message);
      setSettlements(settlements.filter((settlement) => settlement.id !== id));
      setError(null);
      router.refresh();
    } catch {
      setError("기록을 삭제하지 못했어요. 다시 시도해 주세요.");
    }
  }

  return (
    <div className="settlement-layout">
      <form className="settlement-form" onSubmit={addRound}>
        <fieldset disabled={saving} className="settlement-inputs">
        <div className="session-settings">
        <div className="settlement-fields">
          <label>날짜<input className="field" type="date" value={session.title} onChange={(event) => persistSession({ ...session, title: event.target.value })} /></label>
          <label>게임<select className="field" value={game} onChange={(event) => setGame(event.target.value)}>{GAME_OPTIONS.map((name) => <option key={name}>{name}</option>)}</select></label>
        </div>
        <label className="stake-field">1인당 판돈<input className="field" inputMode="numeric" type="number" min="0" step="1000" value={stake} onChange={(event) => setStake(event.target.value)} /></label>
        </div>
        <label className="team-option"><input type="checkbox" checked={teamGame} onChange={(event) => setTeamGame(event.target.checked)} /><span>팀전<small>이긴 사람끼리, 진 사람끼리 같은 팀</small></span></label>
        <div className="member-picker">
          <span>참가 멤버</span>
          <div>{memberOptions.map((player) => <button aria-pressed={participants.includes(player)} className={`chip ${participants.includes(player) ? "chip-selected" : ""}`} type="button" key={player} onClick={() => toggleParticipant(player)}>{player}</button>)}</div>
          <div className="member-adder"><input className="field" aria-label="새 멤버 이름" value={newMember} onChange={(event) => setNewMember(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addMember(); } }} placeholder="새 멤버 이름" /><button className="add-member-button" type="button" onClick={addMember}>추가</button></div>
        </div>
        {participants.length > 0 && <>
          <div className="member-picker">
            <span>진 사람</span>
            <div>{participants.map((player) => <button aria-pressed={losers.includes(player)} className={`chip ${losers.includes(player) ? "loser-selected" : ""}`} type="button" key={player} onClick={() => toggleLoser(player)}>{player}</button>)}</div>
          </div>
          <div className="settlement-preview">
            <div className="amount-heading"><span>이번 판 정산</span></div>
            <AmountList amounts={roundAmounts} />
          </div>
        </>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="save-button" type="submit">이번 판 추가</button>
        </fieldset>
      </form>

      <div className="settlement-history" aria-live="polite">
        <div className="ledger-heading"><h3>진행 중 기록</h3><span className="round-count">{session.rounds.length}판</span></div>
        {session.rounds.length === 0 ? <p className="empty-state">판을 추가하면 여기에 차례로 쌓입니다.</p> : <>
          <ol className="round-list">{session.rounds.map((round, index) => <li key={round.id}><span className="round-label"><span>{index + 1}판</span><span>{round.game ?? "미분류"}</span></span><AmountList amounts={round.amounts} /></li>)}</ol>
          <div className="running-total"><span>현재 누적</span><AmountList amounts={runningTotals} /></div>
          <button className="finish-button" type="button" disabled={saving} onClick={finishSession}>{saving ? "저장 중…" : "최종 저장하고 승률 반영"}</button>
        </>}
        {settlements.length > 0 && (
          <div className="completed-sessions">
            <h3>완료한 모임</h3>
            {settlements.map((settlement) => (
              <div className="completed-session" key={settlement.id}>
                <details>
                  <summary>{settlement.title} <span>{settlement.rounds.length}판</span></summary>
                  <AmountList amounts={totalAmounts(settlement.rounds)} />
                  <ol className="round-list">
                    {settlement.rounds.map((round, index) => <li key={round.id}><span className="round-label"><span>{index + 1}판</span><span>{round.game ?? "미분류"}</span></span><AmountList amounts={round.amounts} /></li>)}
                  </ol>
                </details>
                <button className="delete-session-button" type="button" onClick={() => deleteSettlement(settlement.id, settlement.title)}>삭제</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AmountList({ amounts }: { amounts: Amounts }) {
  return <ul>{Object.entries(amounts).map(([player, amount]) => <li key={player}><span>{player}</span><strong className={amount >= 0 ? "positive" : "negative"}>{amount > 0 ? "+" : ""}{amount.toLocaleString()}원</strong></li>)}</ul>;
}
