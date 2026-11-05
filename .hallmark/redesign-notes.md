# Settlement workbench redesign

2026-11-05. Custom treatment from the user-supplied grayscale tactile dashboard reference.

Preserved: all 2 recorded navigation destinations, 5 rendered fields, 13 handlers, 1 recorded figure, existing API/database logic and browser drafts. Prior Supabase implementation changes remain in the working tree; the redesign baseline is saved locally and ignored by Git.

Changed presentation: dark vertical navigation becomes horizontal below 800px; grey shell and inset editable controls; side-by-side form and running ledger become one column on mobile; foreground/background, field edges and focus rings have been checked by Hallmark's render tier.

Copy changes:
- 진행 중 기록 0판 -> 진행 중 기록, with the live count as an adjacent badge (38iii).
- 최종 저장 · 승률 반영 -> 최종 저장하고 승률 반영 (63).
- Round/game metadata now uses separate spans instead of a middle dot (63).
- Partner statistics use / rather than a middle dot (63).
- Team-game label and its existing parenthetical explanation are on separate lines.

Checks: npm test (8 passed), ESLint, TypeScript; responsive widths 320, 360, 375, 390, 430, 768, 1024, 1440, 1920 with no document overflow, 16px inputs and >=44px control heights. Separate disposable browser context verified participant selection, 5,000/−10,000/5,000 round balances, add-round, reload persistence and expanded insights/table. No production data was written by these redesign tests.

Hallmark: 0 FAIL, 0 open REFLEX, 0 WARN; gate 23 waived because the reference's dark neutral rail and black actions occupy about 9.4% of the first viewport. Finish review: independent subagent, ship, no findings. Existing missing loading skeleton was not introduced in this presentation-only change.

No routes/components were deleted in this redesign; no deployment or Git push.
