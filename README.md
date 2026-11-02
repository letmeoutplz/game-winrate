# Game Winrate

친구들과 진행한 게임의 승률과 내기 정산을 기록하는 Next.js 앱입니다. 진행 중인 모임은 브라우저에 임시 저장하고, 최종 저장한 모임은 Supabase에서 함께 관리합니다.

## 로컬 실행

```bash
npm install
cp .env.local.example .env.local
npm run dev -- --port 3001
```

[http://localhost:3001](http://localhost:3001)에서 확인할 수 있습니다.

## 환경변수

`.env.local`에 다음 값을 설정합니다.

- `NOTION_TOKEN`, `NOTION_DATABASE_ID`, `NOTION_DATA_SOURCE_ID`: 기존 경기 기록
- `SUPABASE_URL`: 정산 기록을 저장할 Supabase 프로젝트 URL
- `SUPABASE_SECRET_KEY`: 서버에서만 사용하는 Supabase Secret key

`SUPABASE_SECRET_KEY`는 브라우저 코드나 Git 저장소에 올리지 마세요.

## 확인

```bash
npm run lint
npx tsc --noEmit
```
