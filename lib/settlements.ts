export type Amounts = Record<string, number>;
export type Round = { id: string; amounts: Amounts };
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
      && round.amounts
      && Object.values(round.amounts).every((amount) => Number.isFinite(amount))
      && Object.values(round.amounts).reduce((sum, amount) => sum + amount, 0) === 0);
}
