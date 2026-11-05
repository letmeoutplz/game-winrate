# 내기 승률 대시보드

현재 데이터 흐름과 실행 방법은 README.md를 참고합니다.

- `lib/games.ts`: 공용 타입·선택지, 저장한 정산의 판별 승패 변환
- `lib/game-store.ts`: Supabase의 기존 경기와 정산 기록 조회
- `lib/settlement-store.ts`: 정산 모임 조회
- `lib/stats.ts`: 참가자 승률, 팀전 파트너 추천·상성, 기원 누적 승률
- `components/SettlementLedger.tsx`: 판 입력 → 브라우저 임시 저장 → Supabase 최종 저장

노션에서 별도 경기 기록을 업데이트하던 방식은 폐지했습니다. 2026-11-05에 기존 16건을 Supabase `game_history`로 이전했고, 원본 노션은 보존했습니다. 새 경기는 정산 장부에 한 번만 입력합니다.
