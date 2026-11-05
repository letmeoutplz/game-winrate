export type Amounts = Record<string, number>;
export type Round = { id: string; amounts: Amounts; game?: string; date?: string; teamGame?: boolean };
export type Settlement = {
  id: string;
  title: string;
  note: string;
  rounds: Round[];
  createdAt: string;
};

export function isSettlement(value: unknown): value is Settlement {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Settlement>;
  return typeof item.id === "string"
    && typeof item.title === "string"
    && item.title.trim().length > 0
    && item.title.length <= 100
    && typeof item.note === "string"
    && item.note.length <= 500
    && typeof item.createdAt === "string"
    && !Number.isNaN(Date.parse(item.createdAt))
    && Array.isArray(item.rounds)
    && item.rounds.every((round) => round
      && typeof round.id === "string"
      && (round.game === undefined || (typeof round.game === "string" && round.game.trim().length > 0 && round.game.length <= 100))
      && (round.date === undefined || (typeof round.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(round.date) && !Number.isNaN(Date.parse(round.date)) && new Date(round.date).toISOString().slice(0, 10) === round.date))
      && (round.teamGame === undefined || typeof round.teamGame === "boolean")
      && round.amounts
      && typeof round.amounts === "object"
      && !Array.isArray(round.amounts)
      && Object.values(round.amounts).every((amount) => Number.isFinite(amount))
      && Object.values(round.amounts).reduce((sum, amount) => sum + amount, 0) === 0);
}
