# 내기 승률 대시보드 — 작업 정리

## 배경
노션 "내기 매출" DB(게임 결과 기록)를 보다가 "일렙이랑 하면 승률 좋다"는 감을
숫자로 확인하고 싶어서 시작. 노션 네이티브 그룹뷰+평균 집계로 1차 구현했다가,
승률 추이/상대전적 같은 복합 지표는 노션 차트로 안 돼서 Next.js 대시보드로 확장.

## 노션 쪽 (1차 시도, 지금은 미사용)
- DB: `매출 내역 데이터` (페이지: 💰 내기 매출 > 🕒 내역)
- 속성: 게임(select), 금액(number, +승/-패), 날짜, 정산내역(title), 완료(checkbox),
  나의 팀원 / 상대 팀원(multi-select)
- `📊 요약` 섹션에 차트뷰 2개 추가: "팀원별 승률"(GROUP BY 나의 팀원, AVG 승),
  "팀원별 게임수"(카운트) — 표본 착시 방지용
- → 이후 Next.js 대시보드로 대체, 노션 차트뷰는 그대로 남겨둠

## Next.js 대시보드 (`game-winrate/`)
로컬 전용, 인증 없음 (`npm run dev -- -p 3001`).

### 데이터 흐름
- `lib/notion.ts`: `@notionhq/client`로 노션 데이터소스 읽기/쓰기
  - **주의**: 이 DB는 data source가 3개라 `database_id` parent로 페이지 생성 시
    노션 API가 거부함(`multiple_data_sources_for_database`) → 반드시
    `parent: { data_source_id }`로 생성해야 함
  - `.env.local`: `NOTION_TOKEN`, `NOTION_DATABASE_ID`, `NOTION_DATA_SOURCE_ID`
  - DB에 공유(Connect to)로 통합을 추가해야 API 접근 가능
- `lib/stats.ts`: 순수 계산 함수
  - `winRateByTeammate`: 내가 이 사람과 팀했을 때 승률
  - `winRateByParticipant`: 팀원이든 상대편이든 등장한 모든 사람의 승률
    (상대편일 땐 내가 짐 = 그 사람 승리로 뒤집어 계산)
  - `headToHead`: 나의 팀원 × 상대 팀원 매트릭스
  - `cumulativeWinRateTrend`: 날짜순 누적 승률
  - **베이지안 보정**(`adjustedWinRate`): 표본이 적을수록 전체 평균 쪽으로
    당김 — `(승 + N×전체평균) / (경기수 + N)`, N=3. 1판 100%와 3판 100%가
    같은 무게로 보이는 문제 해결용. 원래 승률(`winRate`)은 옆에 작게 병기.

### 화면 구성 (`app/page.tsx`)
1. 게임별 파트너 추천 — 게임 종류(전체/모마/롤/마리오파티) 칩 선택 시
   그 게임에서 나랑 팀했을 때 승률 1위 파트너 추천
2. 참가자별 승률 (전체) — 팀원/상대편 통틀어 전원
3. 누적 승률 추이 — SVG 라인 차트
4. 상대전적 매트릭스
5. 새 경기 추가 폼 — 노션에 바로 write-back, 실패 시 화면에 에러 메시지 표시

### 디자인
iOS 26 "Liquid Glass" 스타일 적용 (`app/globals.css`): 블러 유리 카드,
캡슐형 버튼/칩, 흑백 그레이스케일, SF Pro 타이포, 라이트/다크 자동 대응.

## 실행 방법
```
cd game-winrate
npm run dev -- -p 3001
```
`.env.local`에 실제 노션 토큰 필요, 대상 DB에 통합 연결(Connect to) 필수.

## 스킵한 것
- 배포/외부 접속, 로그인 — 로컬 전용이라 불필요
- Wilson score 등 더 엄밀한 통계 보정 — 베이지안 평균으로 충분히 해결됨
