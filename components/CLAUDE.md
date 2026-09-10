# components/ — UI 컨벤션 · 화면 레이아웃

이 폴더의 컴포넌트를 만들거나 고칠 때 지키는 규칙. `app/globals.css` 의 디자인 토큰과
`app/layout.tsx` 의 셸도 함께 다룬다. 상시 규칙(보안·비밀값)은 루트 `CLAUDE.md` 에 있다.

## UI/UX 컨벤션

- 로딩 표시: 목록 화면(라우트 단위 데이터 조회)은 `app/**/loading.tsx`(Next.js 라우트 로딩)로, 폼 제출 중 상태는 `components/PendingOverlay.tsx`(`useFormStatus` 기반, `<form>` 안에 렌더링해야 함)로 표시한다. 둘 다 `components/CenteredSpinner.tsx`를 재사용한다.
- 화면 전환: 새로 마운트되는 화면 콘텐츠에는 `animate-fade-in` 클래스(`app/globals.css`에 정의)를 붙여 급격한 전환을 완화한다.
- 성공 확인 후에만 UI를 바꾸는 애니메이션(낙관적 업데이트 금지): 서버 액션을 `<form action={...}>`에 직접 넘기지 않고, 클라이언트 쪽 래퍼 함수 안에서 `await`한 뒤 예외 없이 끝난 경우에만 애니메이션 상태를 켠다. 실패(에러로 인한 `redirect` 등)는 그대로 전파시켜 기존 에러 처리가 그대로 동작하게 둔다 — `components/WishlistItemCard.tsx`의 "구매" 버튼이 이 패턴의 예시.
- 폼 스타일: 공통 `inputClass`(`rounded-xl border-surface-border bg-input-bg ... focus:border-accent`) 패턴을 새 폼에도 동일하게 적용한다. **입력창 배경은 `bg-surface`가 아니라 `bg-input-bg`를 쓴다** — 있템/위시 추가·수정 화면이 흰 카드(`bg-surface`) 안에 들어있어서, 입력창까지 `bg-surface`를 쓰면 카드와 색이 같아져 경계가 안 보인다. `--input-bg`(`app/globals.css`, 기본값 `#fafbfb`)는 카드보다 살짝 어두운 톤으로 이 대비를 위해 존재하는 전용 토큰이다. 카테고리 칩·수량 스테퍼 버튼처럼 카드 위에 놓이는 다른 폼 컨트롤도 동일하게 `bg-input-bg`를 쓴다.
- 폼 하단에 저장 외에 삭제처럼 별도 서버 액션(별도 `<form>`)이 필요한 보조 버튼을 붙일 때는 `OwnedItemForm`/`WishlistItemForm`의 `secondaryAction` prop(ReactNode)을 쓴다 — 저장 버튼과 같은 줄에 나란히 렌더링된다. 부모 페이지에서 폼 전체를 감싸는 별도 flex 컬럼으로 나누지 않는다 — 그렇게 하면 짧은 삭제 버튼 쪽에 세로로 긴 빈 공간이 생겨 어색해 보인다(실제로 한 번 겪은 문제).
- 이메일 저장(로그인 화면): `localStorage` 키 `already-got-it:remembered-email`에 이메일만 저장한다. **비밀번호는 절대 저장하지 않는다.**
- 첫 로그인 온보딩: `components/OnboardingProvider.tsx`가 있템 목록(`/`) 첫 진입 600ms 후 4단계 투어(`components/OnboardingTour.tsx`)를 자동으로 연다. 완료/건너뛰기 여부는 `has_seen_onboarding`(Supabase `user_metadata`, `markOnboardingSeen` 서버 액션으로 기록, 멱등)로 저장하며 별도 테이블을 두지 않는다 — 닉네임과 같은 패턴. `useOnboardingReplay()`로 언제든 다시 열 수 있다(`ProfileMenu`의 "다시 보기" 등).
- 힌트 배지: `components/HintBadge.tsx`가 수량/D-day/위시 구매/쓴템 되돌리기 등 핵심 컨트롤에 상시 노출되는 "?" 배지다. 투어가 열려 있거나 이미 완료된 뒤에는 pulse 애니메이션을 생략한다(`useOnboardingStatus()`로 판단). 봤는지 여부는 `lib/tooltip-hints.ts`가 `localStorage` 키 `already-got-it:seen-tooltips`에 배지 id 배열로 저장한다 — `lib/client-session.ts`의 `clearClientSessionState()`가 "예외 하나만 남기고 전부 삭제" 방식이라 이 키는 로그아웃 시 별도 등록 없이 자동으로 지워진다.

## 화면 레이아웃 (사이드바 셸)

- 최상단 네비게이션은 `components/Sidebar.tsx` 하나다(과거 `Header.tsx`는 삭제됨). 데스크톱(`md:` 이상)은 좌측 고정 세로 사이드바, 그 아래는 상단 가로 바로 접힌다. 새 탭을 추가할 때는 이 파일의 `TABS` 배열에 추가하면 되고, `lib/auth-routes.ts`의 `isAuthExemptPath`가 참인 경로(`/login`/`/forgot-password`/`/reset-password`/`/preview*`)에서는 자동으로 숨겨진다(해당 로직 그대로 유지). **인증 예외 경로 목록 자체는 여기서 고치지 않는다** — 정본 규칙과 `lib/auth-routes.ts` 단일 소스 원칙은 `docs/rules/auth.md` 에 있다.
- `app/layout.tsx`의 `<main>`은 폭을 제한하지 않는다 — 각 페이지가 자기 콘텐츠에 맞는 폭을 직접 정한다: 목록(카드 그리드) 화면은 `max-w-6xl`, 폼(추가/수정) 화면은 `max-w-4xl`, 로그인/회원가입은 `AuthScreen` 내부의 `max-w-[1000px]`. 새 페이지를 추가할 때 이 관례를 따른다.
- 있템/위시/쓴템 목록은 세로 리스트가 아니라 CSS 그리드(`grid-cols-[repeat(auto-fill,minmax(...px,1fr))]`)다. D-day 배지 색상 구분(`components/OwnedItemCard.tsx`)은 목업이 생략해 보여도 유지해야 하는 기존 SHALL 요구사항이니, 카드 레이아웃을 손댈 때 색상 로직 자체는 건드리지 않는다.
