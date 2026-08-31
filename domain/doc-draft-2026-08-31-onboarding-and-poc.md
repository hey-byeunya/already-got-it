# 문서 초안 — 2026-07-23(`dc9526c`) 이후 diff (2026-08-31 작성, 같은 날 반영/승격)

**범위**: `dc9526c..HEAD` (병합 커밋 제외, 실질 변경 커밋: `82c53bc` 문서 승격, `b15f5c9` AI PoC, `a8e99f0` 온보딩 투어/힌트 배지, `00db684` CLAUDE.md 분리, `a327899`+`4c77e85` 고객용 도움말)
**문서 표면**: `CLAUDE.md`, `docs/rules/{fields,auth,session,data-access}.md`, `components/CLAUDE.md`, `docs/manual-qa.md`, `PRD.md`, `README.md`, `openspec/changes/*/{proposal,tasks,specs/**}.md` (2026-08-28 `00db684`로 구조 변경됨 — 이 초안은 새 구조 기준)

## 요약표

| diff 종류 | 대상 문서 섹션 | 상태 |
|---|---|---|
| `00db684` CLAUDE.md → 주제별 문서 분리 | `CLAUDE.md`, `docs/rules/*.md`, `components/CLAUDE.md`, `docs/manual-qa.md`, `README.md` 문서 목록 | 이미 반영됨(이 커밋 자체가 반영) |
| `82c53bc` PR-문서 매칭 리뷰를 `domain/`으로 승격 | *(해당 없음 — 일지 성격)* | 문서 불필요 |
| **온보딩 투어(4단계, 최초 로그인 1회) + 상시 "?" 힌트 배지** | `components/CLAUDE.md` UI/UX컨벤션 | **반영됨(2026-08-31)** |
| **투어 재실행/힌트 완료 상태 저장 방식** (`user_metadata.has_seen_onboarding`, `localStorage: already-got-it:seen-tooltips`) | `components/CLAUDE.md` | **반영됨(2026-08-31)** |
| 온보딩 투어 기능 자체 (PRD 기능 목록) | `PRD.md` §2 기능, §7 완성 기준(changelog) | **반영됨(2026-08-31)**, 버전 v1.5→v1.6 |
| 수동 QA 항목 (투어/힌트 확인) | `docs/manual-qa.md` | **반영됨(2026-08-31)** |
| `WishlistItemCard` 중첩 `<a>` 하이드레이션 크래시 수정 | *(버그 수정, 동작 변화 없음)* | 문서 불필요 |
| `eslint.config.mjs`에 `poc/**` 제외 추가 | *(툴링 설정, 컨벤션 아님)* | 문서 불필요 |
| **`poc/inventory-ai` AI PoC (사진 기반 등록 + OCR + 장바구니 잔소리 봇 실험)** | `PRD.md` §5 Won't("바코드 스캔·사진 인식 자동 등록"), `docs/help/faq.md`("사진을 찍어 물건을 자동으로 알아보는 기능도 없습니다") | **확인 필요(미해결)** — 아래 참고 |
| `a327899`/`4c77e85` 고객용 도움말 7건 신설/보강 | `docs/help/*.md` | *(스코프 밖 — 아래 참고)* |

## 반영됨 (2026-08-31)

### `components/CLAUDE.md` — UI/UX 컨벤션에 추가된 절

기존 "이메일 저장(로그인 화면)" 불릿 바로 아래에 추가:

```
- 첫 로그인 온보딩: `components/OnboardingProvider.tsx`가 있템 목록(`/`) 첫 진입 600ms 후 4단계 투어(`components/OnboardingTour.tsx`)를 자동으로 연다. 완료/건너뛰기 여부는 `has_seen_onboarding`(Supabase `user_metadata`, `markOnboardingSeen` 서버 액션으로 기록, 멱등)로 저장하며 별도 테이블을 두지 않는다 — 닉네임과 같은 패턴. `useOnboardingReplay()`로 언제든 다시 열 수 있다(`ProfileMenu`의 "다시 보기" 등).
- 힌트 배지: `components/HintBadge.tsx`가 수량/D-day/위시 구매/쓴템 되돌리기 등 핵심 컨트롤에 상시 노출되는 "?" 배지다. 투어가 열려 있거나 이미 완료된 뒤에는 pulse 애니메이션을 생략한다(`useOnboardingStatus()`로 판단). 봤는지 여부는 `lib/tooltip-hints.ts`가 `localStorage` 키 `already-got-it:seen-tooltips`에 배지 id 배열로 저장한다 — `lib/client-session.ts`의 `clearClientSessionState()`가 "예외 하나만 남기고 전부 삭제" 방식이라 이 키는 로그아웃 시 별도 등록 없이 자동으로 지워진다.
```

### `PRD.md` §2 기능 — 추가된 불릿

```
- 첫 로그인 시 있템 목록 화면에서 4단계 투어가 자동으로 뜨고(건너뛰기 가능), 프로필 메뉴에서 언제든 다시 볼 수 있다. 수량/D-day/위시 구매/쓴템 되돌리기 등 핵심 컨트롤에는 눌러서 볼 수 있는 "?" 힌트 배지가 상시 노출된다
```

### `PRD.md` §7 완성 기준 — 추가된 changelog 문단

```
이후 첫 로그인 사용자를 위한 4단계 온보딩 투어와, 핵심 컨트롤에 상시 노출되는 힌트 배지를 추가함.
```

버전도 v1.5 → v1.6, 최종 수정일 2026-08-31로 갱신됨.

### `docs/manual-qa.md` — 추가된 체크리스트 항목

```
- 신규 계정으로 처음 로그인하면 온보딩 투어가 자동으로 뜨는지, 건너뛰기/완료 후 다시 로그인해도 재노출되지 않는지, 프로필 메뉴의 "다시 보기"로는 다시 뜨는지 확인
- 수량/D-day/위시 구매/쓴템 되돌리기의 "?" 힌트 배지가 눌러서 보이는지, 한 번 확인한 배지는 pulse가 사라지는지 확인
```

## 확인 필요 (미해결)

**`poc/inventory-ai`(사진으로 등록 + 잔소리 봇 실험) vs 고객 문서의 "미지원" 문구.** `PRD.md` §5 Won't 3번("바코드 스캔·사진 인식 자동 등록")과 `docs/help/faq.md`("사진을 찍어 물건을 자동으로 알아보는 기능도 없습니다")는 지금 이 순간 사실과 맞다 — PoC는 아직 실험 단계(`poc/` 아래 독립 프로젝트, 앱에 연결 안 됨)라 정식 기능이 아니다. 다만 이 실험이 실제로 이어지는 경우, 두 문서 모두 바로 갱신 대상이 되므로 diff만으로는 어떤 문구가 맞을지("지원 안 함" 유지 vs "준비 중"으로 톤 변경) 결정할 수 없다 — 제품 방향 결정이 필요해서 문장을 만들지 않았다. (already-got-it 프로젝트 백로그에서 별도로 판단하기로 함.)

## 스코프 밖

`docs/help/*.md`(고객용 도움말)는 이 스킬의 개발 규칙 문서 표면에 포함하지 않는다 — 독자와 말투가 달라 이 초안이 대신 쓰지 않는다. 위 "확인 필요" 항목의 `faq.md` 부분도 이런 이유로 초안 문장 없이 대조만 남겼다.

---

`components/CLAUDE.md`/`PRD.md`/`docs/manual-qa.md` 3개 파일은 이 초안 그대로 실제 반영 완료(2026-08-31). AI PoC 관련 1건만 제품 결정 대기 중 미해결로 남음. 지난번 PR-문서 매칭 리뷰(`review/2026-07-23-pr-doc-matching.md` → `domain/2026-07-23-pr-doc-matching.md`)와 같은 방식으로, 검토가 끝난 이 초안도 `review/`에서 `domain/`으로 승격해 트래킹 문서로 남긴다.
