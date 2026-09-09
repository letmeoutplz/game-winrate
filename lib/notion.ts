import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const dataSourceId = process.env.NOTION_DATA_SOURCE_ID!;

export type Game = {
  id: string;
  game: string;
  amount: number;
  date: string;
  title: string;
  completed: boolean;
  myTeam: string[];
  oppTeam: string[];
  result: "win" | "lose" | "draw";
};

export const GAME_OPTIONS = ["모마", "롤", "마리오파티"] as const;
export const PLAYER_OPTIONS = ["기원", "일렙", "지석", "동성", "용현", "현재"] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toGame(page: any): Game {
  const p = page.properties;
  const amount = p["금액"]?.number ?? 0;
  return {
    id: page.id,
    game: p["게임"]?.select?.name ?? "",
    amount,
    date: p["날짜"]?.date?.start ?? "",
    title: p["정산내역"]?.title?.[0]?.plain_text ?? "",
    completed: p["완료"]?.checkbox ?? false,
    myTeam: (p["나의 팀원"]?.multi_select ?? []).map((o: { name: string }) => o.name),
    oppTeam: (p["상대 팀원"]?.multi_select ?? []).map((o: { name: string }) => o.name),
    result: amount > 0 ? "win" : amount < 0 ? "lose" : "draw",
  };
}

export async function getGames(): Promise<Game[]> {
  const games: Game[] = [];
  let cursor: string | undefined;
  do {
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: cursor,
      sorts: [{ property: "날짜", direction: "ascending" }],
    });
    games.push(...res.results.map(toGame));
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return games;
}

export async function addGame(input: {
  game: string;
  amount: number;
  date: string;
  title: string;
  myTeam: string[];
  oppTeam: string[];
  completed: boolean;
}) {
  await notion.pages.create({
    parent: { data_source_id: dataSourceId },
    properties: {
      "정산내역": { title: [{ text: { content: input.title } }] },
      "게임": { select: { name: input.game } },
      "금액": { number: input.amount },
      "날짜": { date: { start: input.date } },
      "완료": { checkbox: input.completed },
      "나의 팀원": { multi_select: input.myTeam.map((name) => ({ name })) },
      "상대 팀원": { multi_select: input.oppTeam.map((name) => ({ name })) },
    },
  });
}
