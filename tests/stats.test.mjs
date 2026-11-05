import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';

async function load(file) {
  const source = await fs.readFile(new URL(file, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
const { gamesFromSettlements } = await load('../lib/games.ts');
const { isSettlement } = await load('../lib/settlements.ts');
const { winRateByParticipant, winRateByTeammate, cumulativeWinRateTrend, headToHead } = await load('../lib/stats.ts');
const session = (rounds) => ({ id: 'session', title: '2026-11-05', note: '', createdAt: '2026-11-05T00:00:00Z', rounds });
const round = (amounts, extra = {}) => ({ id: 'round', amounts, ...extra });

test('each round counts once, even when session totals cancel out', () => {
  const games = gamesFromSettlements([session([
    round({ 기원: 5000, 일렙: -10000, 지석: 5000 }),
    round({ 기원: -5000, 일렙: 5000 }, { id: 'round2' }),
  ])]);
  const me = winRateByParticipant(games).find(s => s.name === '기원');
  assert.equal(me.games, 2);
  assert.equal(me.winRate, 0.5);
  assert.equal(games.reduce((total, g) => total + g.amount, 0), 0);
});

test('a round without 기원 updates participants but not personal trend or partners', () => {
  const games = gamesFromSettlements([session([round({ 일렙: 5000, 지석: -5000 }, { teamGame: true })])]);
  assert.equal(winRateByParticipant(games).find(s => s.name === '일렙').winRate, 1);
  assert.deepEqual(cumulativeWinRateTrend(games), []);
  assert.deepEqual(winRateByTeammate(games), []);
});

test('individual winners are not treated as teammates; explicit team games are', () => {
  const amounts = { 기원: -5000, 일렙: -5000, 지석: 10000 };
  const solo = gamesFromSettlements([session([round(amounts)])]);
  assert.deepEqual(winRateByTeammate(solo), []);
  assert.equal(headToHead(solo).table.size, 0);
  const team = gamesFromSettlements([session([round(amounts, { teamGame: true, game: '롤' })])]);
  assert.equal(winRateByTeammate(team).find(s => s.name === '일렙').wins, 0);
  assert.equal(winRateByParticipant(team).find(s => s.name === '지석').wins, 1);
});

test('old rounds keep unknown game and team metadata; round date survives date changes', () => {
  const games = gamesFromSettlements([session([round({ 기원: 1000, 일렙: -1000 }), round({ 기원: 1000, 일렙: -1000 }, { date: '2026-11-04' })])]);
  assert.equal(games[0].game, '미분류');
  assert.equal(games[0].teamGame, false);
  assert.equal(games[0].date, '2026-11-05');
  assert.equal(games[1].date, '2026-11-04');
});

test('empty/zero rounds do not invent wins and deletion removes their statistics', () => {
  assert.deepEqual(gamesFromSettlements([session([round({ 기원: 0, 일렙: 0 })])]), []);
  assert.deepEqual(winRateByParticipant(gamesFromSettlements([])), []);
});

test('legacy games retain draw exclusion and teammate statistics', () => {
  const base = { myTeam: ['기원', '일렙'], oppTeam: ['지석'], date: '2026-09-01' };
  const games = [{ ...base, result: 'win' }, { ...base, result: 'draw' }];
  assert.equal(winRateByTeammate(games).find(s => s.name === '일렙').games, 1);
  assert.equal(cumulativeWinRateTrend(games).length, 1);
});

test('new metadata is validated while legacy sessions remain accepted', () => {
  const valid = (extra) => session([round({ 기원: 5000, 일렙: -5000 }, extra)]);
  assert.equal(isSettlement(valid({})), true);
  assert.equal(isSettlement(valid({ game: '롤', date: '2026-11-05', teamGame: true })), true);
  for (const extra of [{ game: 123 }, { date: '2026-02-30' }, { teamGame: 'true' }]) assert.equal(isSettlement(valid(extra)), false);
  assert.equal(isSettlement(session([round({ 기원: 5000, 일렙: -1000 })])), false);
  assert.equal(isSettlement(session([round({ 기원: Infinity })])), false);
});

test('all database pages are fetched using actual returned counts', async () => {
  process.env.SUPABASE_URL = 'https://example.test';
  process.env.SUPABASE_SECRET_KEY = 'test-only';
  const { supabaseRows } = await load('../lib/supabase.ts');
  const previousFetch = global.fetch;
  const offsets = [];
  global.fetch = async (url) => {
    const offset = Number(new URL(url).searchParams.get('offset'));
    offsets.push(offset);
    return new Response(JSON.stringify(offset === 0 ? [{ id: 1 }, { id: 2 }] : offset === 2 ? [{ id: 3 }] : []));
  };
  try {
    assert.deepEqual(await supabaseRows('test?select=*&order=id'), [{ id: 1 }, { id: 2 }, { id: 3 }]);
    assert.deepEqual(offsets, [0, 2, 3]);
  } finally { global.fetch = previousFetch; }
});
