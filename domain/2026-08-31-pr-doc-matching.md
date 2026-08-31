# 최근 머지 PR 4건 — diff ↔ 문서 반영 매칭 조사 (2026-08-31)

지난 조사(`2026-07-23-pr-doc-matching.md`, PR#1~5)의 후속. 그 조사 이후 머지된 PR#6~9를 같은 방법으로 대조했다.

## 조사 방법

- `gh pr list --state merged`로 최근 머지된 PR 확인 → PR#6~9(지난 조사 PR#1~5 이후분)를 대상으로 잡음.
- 여러 커밋을 묶은 PR은 `gh pr view <n> --json commits`로 커밋 목록을 확인해 커밋 단위로 나눠서 분류(PR#6이 `82c53bc`+`b15f5c9` 두 커밋을 묶고 있었음).
- PR로 묶이지 않고 브랜치에 직접 반영된 커밋도 `dc9526c..HEAD` 범위 안에서 함께 확인 — CLAUDE.md 분리(`00db684`), PRD.md 공백 정리(`c546471`, 내용 변경 없음이라 표에서 제외).
- 문서 표면 목록을 2026-08-28 `00db684`(CLAUDE.md → 주제별 문서 분리) 이후 구조로 먼저 갱신하고 대조함 — `CLAUDE.md`, `docs/rules/{fields,auth,session,data-access}.md`, `components/CLAUDE.md`, `docs/manual-qa.md`, `PRD.md`, `README.md`, `openspec/changes/*/**`. (이 대조에 쓰는 `doc-drift-draft` 스킬 자신도 옛 구조를 하드코딩하고 있던 걸 먼저 고치고 시작함.)
- 코드 변경 항목과 문서 변경 항목을 시간순으로 대조해서, 같은 PR 안에서 반영됐는지 / 여전히 미반영인지를 구분.

## PR 목록

| PR | 제목 | 머지 시각 | 커밋 |
|---|---|---|---|
| #6 | Add domain folder with PR-doc matching review | 2026-08-12 05:25 | `82c53bc`, `b15f5c9` |
| #7 | Add first-login onboarding tour and persistent hint badges | 2026-08-12 08:03 | `a8e99f0` |
| #8 | 고객용 도움말 7개 추가 (docs/help/) | 2026-08-31 06:13 | `a327899` |
| #9 | FAQ 세 절 보강 (PR #8 에서 빠진 커밋) | 2026-08-31 06:26 | `4c77e85` |

PR 범위 밖 직접 커밋(참고용, 아래 표 대상 아님): `00db684`+`74012b6`(CLAUDE.md → 주제별 문서 분리, PR 없이 브랜치에 직접 반영, 2026-08-28).

## diff 종류 ↔ 영향받는 문서 섹션 매칭표

| PR | 제목 | diff 종류 | 영향받는 문서 섹션 | 비고 |
|---|---|---|---|---|
| **#6** | Add domain folder with PR-doc matching review | PR-문서 매칭 리뷰를 `domain/`으로 승격 | *(해당 없음)* | 일지 성격, 자기 자신이 문서 |
| | | AI PoC(`poc/inventory-ai`: 사진 인식 등록 + OCR + 장바구니 잔소리 봇 실험) | `PRD.md` §5 Won't("바코드 스캔·사진 인식 자동 등록"), `docs/help/faq.md`("사진 인식 기능 없음") | ⚠️ **확인 필요** — PoC 자체는 README/PROBLEM/EXPERIMENT_RESULTS로 잘 문서화됨. 다만 고객 문서의 "미지원" 문구와 은근히 충돌 — 지금은 사실과 맞지만(PoC가 아직 앱에 안 붙음) 실기능화되는 순간 두 문서가 동시에 스테일해짐. 제품 판단 필요해 문장 안 만들고 대조만 남김 |
| **#7** | Add first-login onboarding tour and persistent hint badges | 온보딩 투어(4단계, 최초 1회) + 상시 "?" 힌트 배지 신설 | *(없음)* | ⚠️ 코드는 이 PR에서 배포됐지만 `components/CLAUDE.md`/`PRD.md`/`docs/manual-qa.md` 어디에도 없었음 — 이 조사(2026-08-31)에서 직접 채움. "지난달 표와 비교" 2번 참고 |
| | | `WishlistItemCard` 중첩 `<a>` 하이드레이션 크래시 수정 | *(없음)* | 버그 수정, 동작 변화 없어 문서 불필요 |
| | | `poc/**`를 ESLint 스코프에서 제외 | *(없음)* | 툴링 설정, 컨벤션 아님 |
| *(PR 없음, 직접 머지)* | CLAUDE.md → 주제별 문서 분리(`00db684`) | 기존 `CLAUDE.md` 내용을 `docs/rules/*.md`+`components/CLAUDE.md`+`docs/manual-qa.md`로 재배치 | 위 파일들 자체 | 이 커밋 자체가 "문서 구조 변경 행위"라 반영 대상이 아니라 반영 그 자체 |
| **#8** | 고객용 도움말 7개 추가 | `docs/help/*.md` 7개 신설 | `docs/help/*.md`(자기 자신) | 개발 규칙 문서와 독자·말투가 달라 이번 조사의 개발 문서 표면 밖으로 둠 |
| **#9** | FAQ 세 절 보강 | `docs/help/faq.md` 3개 절 보강 | `docs/help/faq.md`(자기 자신) | 위와 동일 |
| *(PR7 코드에 대한 소급 반영, 2026-08-31)* | 온보딩 투어/힌트 배지 문서화 | `components/CLAUDE.md` UI/UX컨벤션, `PRD.md` §2·§7(버전 v1.5→v1.6), `docs/manual-qa.md` | PR7의 "없음" 항목을 **사람이 아니라 이 조사 자체가** 직접 채움 |

**부가 관찰**: 지난 조사(PR1-5)에서도 `README.md`는 5건 중 1건만 갱신됐는데, 이번 4건(PR6-9)에서는 단 한 번도 갱신되지 않음.

## 지난달 표와 비교해서 뭐가 달라졌나

**1. 지난달 지적한 두 "없음" 항목은 그대로 해소된 상태 유지**
PR2(쓴템/세션보안)와 PR4(로그인 리다이렉트)는 이번에 다시 확인해도 여전히 `docs/rules/session.md`/`docs/rules/auth.md`에 잘 들어있음 — CLAUDE.md 분리 과정에서 유실 없음.

**2. 같은 패턴이 또 한 번 재현됨 — 이번엔 다음 PR에서도 안 고쳐진 채로 남아있었음**
지난달 "다음에 할 것"으로 제안했던 PR 체크리스트/CI 점검은 도입 안 된 걸로 보이고, PR#7(온보딩 투어+힌트 배지)이 정확히 같은 문제를 반복함 — 코드는 이미 배포됐는데 `components/CLAUDE.md`/`PRD.md`/`docs/manual-qa.md` 어디에도 없었음. 지난달(PR2→PR3)과 달리 이번엔 그 다음 커밋에서도 소급 반영이 안 되고, 이 조사 시점(8/31)까지 그대로 미문서화 상태였음 — 8/28 CLAUDE.md 분리, 8/31 고객 도움말 추가 두 번이나 문서를 만졌는데도 이 기능은 한 번도 언급되지 않음.

**3. 문서 표면 자체가 구조적으로 바뀜**
지난달엔 `CLAUDE.md` 하나 + `PRD.md`/`README.md`/`openspec/`가 전부였는데, 지금은 `docs/rules/*.md`(4개) + `components/CLAUDE.md` + `docs/manual-qa.md`가 새로 생겼고, 개발자용과 별개로 `docs/help/*.md`(고객용 도움말 7개)라는 완전히 다른 독자층의 문서 레이어도 생겼음.

**4. 새로운 종류의 산출물 — 문서화하기 애매한 것도 등장**
`poc/inventory-ai`(사진 인식 등록 + 장바구니 잔소리 봇 실험, PR#6)는 자체 README/PROBLEM/EXPERIMENT_RESULTS로 잘 문서화돼 있지만, 정작 고객용 FAQ("사진 인식 기능 없음")랑 PRD Won't-목록이 이 실험과 은근히 충돌하는 상황이 생김 — 지금 당장 틀린 말은 아니지만(PoC는 아직 앱에 안 붙음), 이 실험이 실제 기능이 되는 순간 두 문서가 동시에 스테일해짐. 기계적으로 답이 안 나오는 제품 결정이라 위 표에도 "확인 필요"로만 남김.

**5. 지난달 내 리뷰 파일 자체가 승격됨**
`review/2026-07-23-pr-doc-matching.md`가 검토 후 `domain/2026-07-23-pr-doc-matching.md`로 커밋되어 트래킹 문서가 됐음(PR#6) — 이번 조사도 같은 방식으로 `review/`에서 검토를 마치고 이 자리(`domain/2026-08-31-pr-doc-matching.md`)로 승격됨.
