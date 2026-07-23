@AGENTS.md

# CLAUDE.md

이 파일은 이 프로젝트에서 작업할 때 지켜야 할 실행 방법과 규칙을 정리한다. 기능/스펙 원문은 `PRD.md`와 `openspec/changes/add-inventory-wishlist/{proposal,design,tasks}.md`, `specs/inventory/spec.md`, `specs/wishlist/spec.md`를 참고할 것.

## 프로젝트 개요

"이미 있어" — 로그인한 사용자가 보유템(물품)과 위시리스트를 관리하는 개인용 재고 관리 웹앱.
스택: Next.js (App Router) + TypeScript + Supabase (Postgres + Auth + RLS) + Tailwind CSS.

## 로컬 실행 방법

1. 의존성 설치
   ```bash
   npm install
   ```
2. [supabase.com](https://supabase.com)에서 새 프로젝트 생성 (무료 티어)
3. Supabase 대시보드 > SQL Editor에서 `supabase/migration.sql` 내용을 그대로 실행
   (`owned_items`/`wishlist_items` 테이블(`owned_items.used_up_at`, `wishlist_items.link` 컬럼 포함), 인덱스, RLS 정책, `mark_wishlist_purchased`/`list_owned_items`/`list_wishlist_items`/`list_owned_categories`/`list_wishlist_categories` 함수 생성)
4. 프로젝트 설정 > API에서 Project URL과 anon public key 확인
5. `.env.local.example`을 복사해 `.env.local` 생성 후 값 채우기
   ```bash
   cp .env.local.example .env.local
   ```
6. 개발 서버 실행
   ```bash
   npm run dev
   ```
   [http://localhost:3000](http://localhost:3000) 접속 → 회원가입 후 이용

## 지켜야 할 규칙

### 보안 / 데이터 격리
- 모든 테이블은 RLS를 켜고 `user_id = auth.uid()` 정책을 건다. RLS 없이는 로그인한 누구나 모든 행을 읽을 수 있으므로, 새 테이블을 추가할 때마다 반드시 같이 추가한다.
- 3중 방어를 항상 지킨다 (RLS 하나만 믿지 않기):
  1. 모든 Server Action 최상단에서 `supabase.auth.getUser()` 확인, 없으면 즉시 에러. 클라이언트가 보낸 `user_id`는 절대 신뢰하지 않는다.
  2. 모든 select/update/delete 쿼리에 `.eq('user_id', user.id)`를 명시한다.
  3. Supabase의 update/delete는 매칭 행이 0개여도 에러 없이 조용히 성공 처리하므로, `.select()`를 붙여 반환 배열이 비어 있으면 직접 "찾을 수 없음" 에러를 던진다 — 그렇지 않으면 타인 데이터 접근 시도가 겉보기에 "성공"으로 보인다.
- 다른 계정으로 로그인했을 때 내 데이터가 전혀 보이지 않는지, 기능을 추가/수정할 때마다 직접 확인한다.

### 위시리스트 → 보유템 전환
- 반드시 `mark_wishlist_purchased` 단일 Postgres RPC 함수로만 처리한다. "위시리스트 삭제 API + 보유템 생성 API"를 애플리케이션 코드에서 두 번 호출해 조합하지 않는다 — 중간에 실패하면 부분 반영 상태(하나만 반영됨)가 생길 수 있기 때문.
- 위시리스트에는 수량 개념이 없으므로 전환된 보유템의 수량은 항상 1로 설정한다.
- 위시리스트 원본에 카테고리가 없으면 NULL로 그대로 넘어가며, 이 때문에 전환 자체가 막혀서는 안 된다.

### 목록 조회 / 검색
- 검색·정렬은 `list_owned_items(p_search)` / `list_wishlist_items(p_search)` RPC로 처리한다. Supabase-js의 `.or('name.ilike...,category.ilike...')`처럼 필터 문자열을 직접 조립하지 않는다 — 검색어에 쉼표나 괄호가 들어가면 PostgREST 필터 문법이 깨질 수 있다.
- 보유템 목록은 `ORDER BY expiry_date NULLS LAST`, D-day는 저장하지 않고 조회 시점에 계산한다. RPC는 이 1차 정렬만 담당하고, "다 씀 항목 최하단 고정 + 다 쓴 것도 보기 토글" 같은 화면 전용 규칙은 클라이언트의 `lib/owned-item-sort.ts`(`sortOwnedItemsForList`)에서 순수 함수로 처리한다 — 새 정렬 규칙이 필요하면 이 함수를 확장하고, RPC의 `ORDER BY`는 그대로 둔다.

### 필드 규칙
- `owned_items.category`: DB 컬럼은 nullable이지만, **신규 등록 폼/API에서는 필수값으로 검증**한다. (위시리스트 전환 경로는 예외 — 원본에 카테고리가 없으면 NULL 허용)
- `owned_items.quantity`: 필수, 미입력 시 기본값 1, 1 이상 정수만 허용 (0 이하·소수는 거부)
- `owned_items.status`: 미개봉/사용중/다 씀 외의 값은 거부
- `wishlist_items.link`: nullable, 선택 입력. 빈 문자열은 저장 전 `null`로 변환한다 (다른 선택 텍스트 필드와 동일 규칙)
- `owned_items.used_up_at`: nullable date. 상태가 "다 씀"으로 바뀌는 순간에만 오늘 날짜로 채우고, 그 외 모든 상태로 바뀔 때(되돌리기 포함)는 반드시 `null`로 되돌린다 — `lib/owned-item-status.ts`의 `deriveUsedUpAt`/`revertUsedItemFields`로만 계산하고 직접 조립하지 않는다. **화면에 "다 씀으로 바뀐 날짜"를 표시할 때는 `used_up_at`이 아니라 `item.updated_at`을 쓴다** (`components/UsedItemCard.tsx`) — `used_up_at`은 마이그레이션 적용 여부에 따라 값이 없을 수 있는 반면 `updated_at`은 테이블 생성 시점부터 항상 존재하고 트리거로 보장되는 필드라 더 안정적이다. **수정(edit) 경로는 신규 등록과 다르게 처리한다**: 이미 "다 씀"인 항목을 다른 필드만 고쳐 재저장해도 상태 자체는 바뀌지 않으므로, 이 경우 `used_up_at`을 오늘 날짜로 다시 덮어쓰지 않고 기존 값을 유지해야 한다 — `lib/owned-item-status.ts`의 `deriveUsedUpAtForUpdate(prevStatus, nextStatus, prevUsedUpAt, today)`로 계산하고(`app/items/[id]/actions.ts`가 수정 전 기존 `status`/`used_up_at`을 먼저 조회해서 넘김), 신규 등록(`app/items/new/actions.ts`)은 이전 상태가 없으므로 계속 단순한 `deriveUsedUpAt`을 쓴다.
- 카테고리 입력 UI: 보유템/위시 등록·수정 폼과 목록 필터는 자유 텍스트 `<input>` 대신 `components/CategoryPicker.tsx`(폼)/`components/CategoryFilter.tsx`(목록 필터)의 칩 선택 UI를 쓴다. 기존 카테고리 목록은 `list_owned_categories()`/`list_wishlist_categories()` RPC로 조회하며, 저장되는 값 자체는 여전히 자유 텍스트 문자열이다(칩은 입력 보조 UI일 뿐 검증 규칙을 바꾸지 않음). 새 폼에 카테고리 입력을 추가할 때도 이 컴포넌트를 재사용한다. **위시 등록/수정 화면(`app/wishlist/new`, `app/wishlist/[id]`)의 카테고리 칩은 `list_wishlist_categories()`와 `list_owned_categories()`를 둘 다 조회해 합집합으로 보여준다** — 위시가 비어 있는 초기 상태에도 있템 쪽 카테고리를 재사용할 수 있게 하기 위함이며, 있템 쪽은 반대로 위시 카테고리를 섞지 않는다(비대칭이 의도된 동작)
- 상태 입력/표시 UI: `components/StatusStepper.tsx`의 `StatusStepper`(목록 카드용 진행형 바)/`StatusSegmentedControl`(폼용 3분할 버튼)을 재사용한다. 선택값은 `<input type="hidden" name="status">`로 기존 서버 액션 시그니처 변경 없이 제출된다

### UI/UX 컨벤션
- 로딩 표시: 목록 화면(라우트 단위 데이터 조회)은 `app/**/loading.tsx`(Next.js 라우트 로딩)로, 폼 제출 중 상태는 `components/PendingOverlay.tsx`(`useFormStatus` 기반, `<form>` 안에 렌더링해야 함)로 표시한다. 둘 다 `components/CenteredSpinner.tsx`를 재사용한다.
- 화면 전환: 새로 마운트되는 화면 콘텐츠에는 `animate-fade-in` 클래스(`app/globals.css`에 정의)를 붙여 급격한 전환을 완화한다.
- 성공 확인 후에만 UI를 바꾸는 애니메이션(낙관적 업데이트 금지): 서버 액션을 `<form action={...}>`에 직접 넘기지 않고, 클라이언트 쪽 래퍼 함수 안에서 `await`한 뒤 예외 없이 끝난 경우에만 애니메이션 상태를 켠다. 실패(에러로 인한 `redirect` 등)는 그대로 전파시켜 기존 에러 처리가 그대로 동작하게 둔다 — `components/WishlistItemCard.tsx`의 "구매" 버튼이 이 패턴의 예시.
- 폼 스타일: 공통 `inputClass`(`rounded-xl border-surface-border bg-input-bg ... focus:border-accent`) 패턴을 새 폼에도 동일하게 적용한다. **입력창 배경은 `bg-surface`가 아니라 `bg-input-bg`를 쓴다** — 있템/위시 추가·수정 화면이 흰 카드(`bg-surface`) 안에 들어있어서, 입력창까지 `bg-surface`를 쓰면 카드와 색이 같아져 경계가 안 보인다. `--input-bg`(`app/globals.css`, 기본값 `#fafbfb`)는 카드보다 살짝 어두운 톤으로 이 대비를 위해 존재하는 전용 토큰이다. 카테고리 칩·수량 스테퍼 버튼처럼 카드 위에 놓이는 다른 폼 컨트롤도 동일하게 `bg-input-bg`를 쓴다.
- 폼 하단에 저장 외에 삭제처럼 별도 서버 액션(별도 `<form>`)이 필요한 보조 버튼을 붙일 때는 `OwnedItemForm`/`WishlistItemForm`의 `secondaryAction` prop(ReactNode)을 쓴다 — 저장 버튼과 같은 줄에 나란히 렌더링된다. 부모 페이지에서 폼 전체를 감싸는 별도 flex 컬럼으로 나누지 않는다 — 그렇게 하면 짧은 삭제 버튼 쪽에 세로로 긴 빈 공간이 생겨 어색해 보인다(실제로 한 번 겪은 문제).
- 이메일 저장(로그인 화면): `localStorage` 키 `already-got-it:remembered-email`에 이메일만 저장한다. **비밀번호는 절대 저장하지 않는다.**

### 인증 플로우 (회원가입 확장 / 비밀번호 찾기)
- 회원가입 시 닉네임(2~20자)·약관동의 체크박스를 클라이언트(`components/AuthForm.tsx`)와 서버(`app/login/actions.ts`) 양쪽에서 검증한다. 닉네임은 `supabase.auth.signUp`의 `options.data.nickname`으로 `user_metadata`에 저장하며, 별도 프로필 테이블은 두지 않는다
- 약관/개인정보 처리방침 텍스트는 실제 문서가 없으므로 클릭 가능한 링크가 아닌 강조 텍스트로만 표시한다 — 존재하지 않는 문서로 연결되는 허위 링크를 만들지 않는다
- 비밀번호 찾기는 `/forgot-password`(이메일 입력 → `resetPasswordForEmail`) → `/reset-password`(새 비밀번호 입력 → `updateUser({ password })`) 두 단계로 구현한다. `/reset-password`는 Supabase 복구 링크가 URL 프래그먼트 토큰을 담고 오므로 반드시 브라우저 클라이언트(`lib/supabase/client.ts`)를 쓰는 클라이언트 컴포넌트여야 한다 (서버 클라이언트로는 토큰을 읽을 수 없음)
- Supabase 인증 에러를 한국어 안내 문구로 바꾸는 `translateAuthError`(+ `EMAIL_PATTERN`)는 `lib/auth-errors.ts`에 있다 — `app/login/actions.ts`, `app/forgot-password/actions.ts`가 공유해서 쓴다. 새로 raw `error.message`를 그대로 노출하지 말고 이 함수를 거친다. (단, `app/reset-password/page.tsx`는 예외 — 만료된 복구 링크가 지배적인 실패 양상이라 고정된 안내 문구를 그대로 쓴다.)
- 회원가입 직후 이메일 인증 대기 상태로 로그인 화면에 돌아올 때 이메일을 프리필해주는데, 이 이메일은 URL 쿼리스트링이 아니라 `signup_email`이라는 60초 만료 쿠키로 전달한다(`app/login/actions.ts`가 심고 `app/login/page.tsx`가 서버에서만 읽음) — 쿼리스트링에 이메일을 실으면 브라우저 히스토리/서버 로그에 남기 때문.
- `/forgot-password`, `/reset-password`는 로그인 세션 없이도 접근 가능해야 하므로 `lib/auth-routes.ts`의 `isAuthExemptPath`가 반환하는 인증 예외 경로에 포함되어 있다. 이 목록은 `lib/supabase/proxy.ts`와 `components/Sidebar.tsx` **양쪽에서 이 함수 하나만 공유해서 쓴다** — 예전에는 두 파일이 각자 다른 규칙(완전일치 vs 접두사 일치)으로 따로 판정하다가 사이드바가 로그인 화면에 잘못 나타나는 버그가 난 적이 있다. 인증이 필요한 새 라우트를 추가할 때 이 목록과 혼동하지 않고, 예외 경로를 늘릴 땐 반드시 `lib/auth-routes.ts` 한 곳만 고친다.

### 화면 레이아웃 (사이드바 셸)
- 최상단 네비게이션은 `components/Sidebar.tsx` 하나다(과거 `Header.tsx`는 삭제됨). 데스크톱(`md:` 이상)은 좌측 고정 세로 사이드바, 그 아래는 상단 가로 바로 접힌다. 새 탭을 추가할 때는 이 파일의 `TABS` 배열에 추가하면 되고, `lib/auth-routes.ts`의 `isAuthExemptPath`가 참인 경로(`/login`/`/forgot-password`/`/reset-password`/`/preview*`)에서는 자동으로 숨겨진다(해당 로직 그대로 유지).
- `app/layout.tsx`의 `<main>`은 폭을 제한하지 않는다 — 각 페이지가 자기 콘텐츠에 맞는 폭을 직접 정한다: 목록(카드 그리드) 화면은 `max-w-6xl`, 폼(추가/수정) 화면은 `max-w-4xl`, 로그인/회원가입은 `AuthScreen` 내부의 `max-w-[1000px]`. 새 페이지를 추가할 때 이 관례를 따른다.
- 있템/위시/쓴템 목록은 세로 리스트가 아니라 CSS 그리드(`grid-cols-[repeat(auto-fill,minmax(...px,1fr))]`)다. D-day 배지 색상 구분(`components/OwnedItemCard.tsx`)은 목업이 생략해 보여도 유지해야 하는 기존 SHALL 요구사항이니, 카드 레이아웃을 손댈 때 색상 로직 자체는 건드리지 않는다.

### 세션 격리 / 로그아웃
- 로그아웃은 `components/ProfileMenu.tsx`의 클라이언트 래퍼(`handleSignOut`)가 처리한다: 서버 액션(`signOut`, 쿠키만 정리)을 `await`한 뒤 `lib/client-session.ts`의 `clearClientSessionState()`로 로컬/세션 스토리지를 정리(이메일 저장 값 제외)하고, `window.location.href = '/login'`로 **전체 페이지 새로고침**한다. `router.push`류의 클라이언트 사이드 전환을 쓰지 않는 이유: 같은 탭에서 곧바로 다른 계정으로 로그인했을 때 React state나 Next.js 라우터 캐시에 남은 이전 사용자 데이터가 잠깐이라도 보이는 걸 막기 위함이다. 새 클라이언트 저장값을 추가할 때는 로그아웃 시에도 지워지도록 반드시 `clearClientSessionState()` 대상에 포함시킨다(이메일 저장 키만 예외).
- 서버 액션에서 `!user`(세션 만료 등)를 확인할 때는 `throw new Error(...)`가 아니라 `redirect('/login')`을 쓴다 — 던지면 화면에 에러 화면이 뜨면서 그 뒤에 이전 데이터가 계속 표시될 수 있다.
- `components/BfcacheGuard.tsx`(전 페이지에 마운트됨)가 브라우저 뒤로가기 bfcache 복원을 감지해(`pageshow`의 `event.persisted`) 강제로 새로고침한다 — 로그아웃 이전 화면이 캐시에서 그대로 뜨는 것을 막기 위함. `lib/supabase/proxy.ts`도 모든 응답에 `Cache-Control: no-store`를 강제한다.

### 비밀값 관리
- Supabase URL과 **anon public key**만 클라이언트에 노출한다 (`NEXT_PUBLIC_*` 접두사, `.env.local`).
- **service role key는 절대 사용하지도, 커밋하지도 않는다.**
- `.env.local`은 `.gitignore`로 제외하고, `.env.local.example`(값 없는 템플릿)만 커밋한다. `.gitignore`에 `.env*` 규칙을 쓸 경우 `!.env.local.example` 예외를 반드시 함께 추가해 템플릿 파일까지 무시되지 않게 한다.
- **`NEXT_PUBLIC_SITE_URL`을 프로덕션 배포 시 반드시 설정한다** (`app/forgot-password/actions.ts`) — 비밀번호 재설정 링크의 도착지(`redirectTo`)를 만들 때 쓰는 값으로, 설정하지 않으면 요청의 `Host` 헤더를 그대로 신뢰하게 되어(로컬 개발 편의용 폴백) 배포 환경의 프록시가 클라이언트가 보낸 `Host`를 그대로 통과시키는 경우 재설정 링크 자체가 공격자 도메인으로 바뀔 수 있다. 프로덕션에서 이 값이 없으면 액션이 에러를 던지도록 fail-closed로 되어 있다. Supabase 대시보드의 Redirect URLs 허용목록도 배포 시 함께 확인한다(최종 방어선).
- 그 외 어떤 비밀값도 코드나 커밋 이력에 노출하지 않는다.

### 도구 / 비용
- 무료 도구만 사용한다 (Supabase 무료 티어, 배포 시에도 무료 플랜 범위 내).

### 스펙 변경 시
- 기능/필드가 바뀌면 코드보다 먼저 `openspec/changes/add-inventory-wishlist`의 `proposal.md`/`design.md`/`tasks.md`/`specs/**/*.md`를 갱신한다.
- 변경 후 `openspec validate add-inventory-wishlist --strict`가 통과하는지 확인하고 나서 구현에 반영한다.

## 완료 기준 (수동 테스트 체크리스트)
- 로그인 → 보유템 등록 → 새로고침해도 남아 있는지
- 이름/카테고리 검색, 사용기한 임박순 정렬 + D-day 배지 확인
- 위시리스트에 담기 → "구매완료" → 위시리스트에서 사라지고 동시에 보유템에 나타나는지 (중간 상태 없음)
- **다른 계정으로 로그인해서 내 물품이 보이지 않는지** (가장 중요)
- 닉네임·약관동의를 채워 회원가입 → 헤더 프로필 메뉴에 닉네임이 표시되는지
- 로그인 화면에서 비밀번호 찾기 → 메일 수신 → 링크로 새 비밀번호 설정 → 새 비밀번호로 로그인되는지
- 위시 항목을 눌러 수정 화면 진입 → 참고 링크 포함 수정 → 목록에 반영되는지
- 카테고리 칩에서 기존 카테고리 선택 및 "+ 새 카테고리" 추가가 모두 정상 저장되는지
- 있템을 "다 씀"으로 바꾸면 있템 목록에서 사라지고 쓴템 탭에 나타나는지, "다 쓴 것도 보기"를 켜면 목록 맨 아래에 다시 보이는지
- 쓴템 탭에서 되돌리기를 누르면 즉시 사라지고 있템 목록에 "사용중" 상태로 나타나는지
- 로그아웃 후 브라우저 뒤로가기를 눌러도 로그아웃 이전 화면(이전 계정 데이터)이 뜨지 않는지, 곧바로 다른 계정으로 로그인해도 이전 계정 데이터가 안 보이는지
