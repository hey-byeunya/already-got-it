# 최근 머지 PR 5건 — diff ↔ 문서 반영 매칭 조사 (2026-07-23)

## 조사 방법

- `gh pr list --state merged`로 최근 머지된 PR 5건(#1~#5) 확인 — 모두 `dev` 브랜치에 대한 단일 커밋 PR이었음.
- 각 PR의 커밋 해시를 기준으로 `git diff <base>..<head>`를 떠서 변경된 파일 목록/디렉터리를 분류.
- 문서 파일(`CLAUDE.md`, `PRD.md`, `README.md`, `openspec/changes/add-inventory-wishlist/**`, `retro/`, `bugs/`)만 따로 골라 diff의 어느 섹션(헤딩)이 새로 생기거나 바뀌었는지 확인.
- 코드 변경 항목과 문서 변경 항목을 시간순으로 대조해서, 같은 PR 안에서 반영됐는지 / 다음 PR로 넘어가서야 반영됐는지 / 끝내 문서화가 안 됐는지를 구분.

## PR 목록

| PR | 제목 | 머지 시각 | 커밋 |
|---|---|---|---|
| #1 | Update favicon and add daily retro | 2026-07-22 11:54 | `09f2b58` |
| #2 | Redesign UI with Claude Design mockup, add used-items tab, and harden session handling | 2026-07-22 16:24 | `4e70057` |
| #3 | Redesign v2 with desktop sidebar shell and card grid, fix layout contrast bugs | 2026-07-23 00:59 | `6ab0bc0` |
| #4 | Fix sidebar leaking onto login screen after signup, prefill email on redirect | 2026-07-23 02:42 | `dfdaf18` |
| #5 | Fix code review findings: used_up_at overwrite, nested forms, header trust, PII in URL | 2026-07-23 06:30 | `dc9526c` |

## diff 종류 ↔ 영향받는 문서 섹션 매칭표

| PR | 제목 | diff 종류 | 영향받는 문서 섹션 | 비고 |
|---|---|---|---|---|
| **#1** | Update favicon and add daily retro | 파비콘 에셋 교체 | *(없음)* | 에셋 파일이라 문서화 대상 아님 |
| | | 회고 기록 신규 | `retro/2026-07-22.md` (신규) | 자기 자신이 문서 |
| **#2** | Redesign UI with Claude Design mockup, add used-items tab, harden session | 디자인 토큰/폰트/로고, Header 개편, 빈 상태 화면 | `CLAUDE.md` UI/UX컨벤션, `PRD.md` §2·§5, `tasks.md` §9, `proposal.md` "리디자인 확장분" | |
| | | 회원가입 확장(닉네임/약관동의) + 비밀번호 찾기 플로우 | `CLAUDE.md` "인증 플로우" 신설, `PRD.md` §2·§3·§5, `tasks.md` §9.3–9.4 | |
| | | 카테고리 칩 선택 UI + 상태 세그먼트 스텝퍼 | `CLAUDE.md` 필드 규칙, `PRD.md` §2·§5, `tasks.md` §9.5–9.6 | |
| | | 위시 참고 링크 + 위시 수정 화면 | `PRD.md` §2·§4·§5, `specs/wishlist/spec.md`(Requirement 신설), `tasks.md` §9.7 | |
| | | **쓴템 탭 신설 + `used_up_at` 필드 + 정렬 로직(`owned-item-sort.ts`) + vitest 도입** | **(없음)** | ⚠️ 코드는 이 PR에서 이미 배포됐지만 `tasks.md` §10, `specs/inventory/spec.md`의 "다 씀 처리 시각 기록" 요구사항은 **PR3에서야** 뒤늦게 신설됨 |
| | | **세션 보안 강화(`client-session.ts`/`BfcacheGuard.tsx`/redirect 통일)** | **(없음)** | ⚠️ 마찬가지로 `CLAUDE.md` "세션 격리" 섹션은 **PR3에서야** 신설 |
| **#3** | Redesign v2 with desktop sidebar shell and card grid | 사이드바 셸 + 카드 그리드(Header 삭제, Sidebar 신설) | `CLAUDE.md` "화면 레이아웃" 신설, `PRD.md` §2·§5, `README.md` 기능목록, `tasks.md` §11 | |
| | | 로그인/회원가입 히어로 패널 | `PRD.md` §2, `tasks.md` §11.6 | |
| | | 위시 카테고리 칩 합집합 + "구매"→"샀어요·있템으로" 라벨 변경 | `CLAUDE.md` 필드 규칙, `tasks.md` §11.4–11.5 | `PRD.md` §2는 이때 라벨 텍스트를 안 고쳐서 여전히 "구매"로 남음(→ PR5에서 정정) |
| | | `--input-bg` 토큰 + 폼 카드 대비 + `secondaryAction` prop | `CLAUDE.md` UI/UX컨벤션, `tasks.md` §11.7–11.8 | |
| | | *(PR2 코드에 대한 소급 문서화)* | `tasks.md` §10 신설, `specs/inventory/spec.md` "다 씀 처리 시각 기록/목록 정렬" Requirement 신설, `CLAUDE.md` "세션 격리" 신설 | 위 PR2의 두 "없음" 항목을 여기서 메꿈 |
| | | 회고/버그리포트 작성 | `retro/2026-07-23.md`, `bugs/2026-07-23.md`(신규) | 자기 자신이 문서 |
| **#4** | Fix sidebar leaking onto login screen after signup, prefill email | signUp 리다이렉트 이중홉 수정 + 이메일 프리필 | **(없음)** | ⚠️ 코드만 변경, 문서 0건 — `PRD.md`/`CLAUDE.md`/openspec 전혀 안 건드림 |
| **#5** | Fix code review findings | `used_up_at` 재저장 덮어쓰기 버그 수정 | `CLAUDE.md` 필드 규칙 확장, `specs/inventory/spec.md`(시나리오 추가), `tasks.md` §12.1 | |
| | | 메모 textarea 복원 + `<form>` 중첩 제거 | `tasks.md` §12.2–12.3 | `CLAUDE.md`엔 컨벤션 레벨 언급 없음(체크리스트에만 기록) — 부분 문서화 |
| | | `Host` 헤더 신뢰 보안 수정(`NEXT_PUBLIC_SITE_URL`) | `CLAUDE.md` "비밀값 관리" 신규, `tasks.md` §12.4 | |
| | | 에러 메시지 공유(`lib/auth-errors.ts`) | `CLAUDE.md` "인증 플로우", `tasks.md` §12.5 | |
| | | 이메일 쿠키 전환 | `CLAUDE.md` "인증 플로우", `tasks.md` §12.6 | |
| | | `auth-routes.ts` 공유(사이드바/프록시 통합) | `CLAUDE.md` 2개 섹션, `tasks.md` §12.7 | |
| | | *(PR4 코드에 대한 소급 문서화)* | `PRD.md` §7 변경이력 문단 추가 | PR4의 "없음" 항목을 여기서 메꿈 |

**부가 관찰**: `README.md`는 5건 중 PR3 한 번만 갱신되고 PR2/PR5는 건드리지 않음 — 리스트/기능 요약이 최신 상태를 못 따라갈 위험이 있는 유일한 문서.

## 패턴 요약

* 한 일: 병합된 PR 5건의 diff를 조사하고, 각 PR에서 실제로 갱신된 문서(CLAUDE.md/PRD.md/README.md/openspec/retro/bugs)를 대조해 "diff 종류 → 영향받는 문서 섹션" 매칭표 작성
* 결과: PR2(쓴템 탭·세션보안)와 PR4(로그인 리다이렉트 수정)는 해당 PR 시점에 문서화가 전혀 안 되고 각각 다음 PR(PR3, PR5)에서 소급 반영됨 — "코드가 문서보다 한 라운드 앞서간다"는 패턴이 이번 조사에서 2번 반복 확인됨. `README.md`는 5건 중 1건에서만 갱신됨
* 다음에 할 것: PR 본문에 "이 변경이 갱신해야 할 문서 섹션" 체크리스트를 추가하거나, `openspec validate`처럼 "코드 변경은 있는데 `openspec/`에 변경이 없으면 경고"하는 가벼운 사전 점검을 CI/pre-commit에 넣는 방안 검토
