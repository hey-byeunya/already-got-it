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
   (`owned_items`/`wishlist_items` 테이블, 인덱스, RLS 정책, `mark_wishlist_purchased`/`list_owned_items`/`list_wishlist_items` 함수 생성)
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
- 보유템 목록은 `ORDER BY expiry_date NULLS LAST`, D-day는 저장하지 않고 조회 시점에 계산한다.

### 필드 규칙
- `owned_items.category`: DB 컬럼은 nullable이지만, **신규 등록 폼/API에서는 필수값으로 검증**한다. (위시리스트 전환 경로는 예외 — 원본에 카테고리가 없으면 NULL 허용)
- `owned_items.quantity`: 필수, 미입력 시 기본값 1, 1 이상 정수만 허용 (0 이하·소수는 거부)
- `owned_items.status`: 미개봉/사용중/다 씀 외의 값은 거부

### UI/UX 컨벤션
- 로딩 표시: 목록 화면(라우트 단위 데이터 조회)은 `app/**/loading.tsx`(Next.js 라우트 로딩)로, 폼 제출 중 상태는 `components/PendingOverlay.tsx`(`useFormStatus` 기반, `<form>` 안에 렌더링해야 함)로 표시한다. 둘 다 `components/CenteredSpinner.tsx`를 재사용한다.
- 화면 전환: 새로 마운트되는 화면 콘텐츠에는 `animate-fade-in` 클래스(`app/globals.css`에 정의)를 붙여 급격한 전환을 완화한다.
- 성공 확인 후에만 UI를 바꾸는 애니메이션(낙관적 업데이트 금지): 서버 액션을 `<form action={...}>`에 직접 넘기지 않고, 클라이언트 쪽 래퍼 함수 안에서 `await`한 뒤 예외 없이 끝난 경우에만 애니메이션 상태를 켠다. 실패(에러로 인한 `redirect` 등)는 그대로 전파시켜 기존 에러 처리가 그대로 동작하게 둔다 — `components/WishlistItemCard.tsx`의 "구매" 버튼이 이 패턴의 예시.
- 폼 스타일: 공통 `inputClass`(`rounded-xl border-surface-border bg-surface ... focus:border-accent`) 패턴을 새 폼에도 동일하게 적용한다.
- 이메일 저장(로그인 화면): `localStorage` 키 `already-got-it:remembered-email`에 이메일만 저장한다. **비밀번호는 절대 저장하지 않는다.**

### 비밀값 관리
- Supabase URL과 **anon public key**만 클라이언트에 노출한다 (`NEXT_PUBLIC_*` 접두사, `.env.local`).
- **service role key는 절대 사용하지도, 커밋하지도 않는다.**
- `.env.local`은 `.gitignore`로 제외하고, `.env.local.example`(값 없는 템플릿)만 커밋한다. `.gitignore`에 `.env*` 규칙을 쓸 경우 `!.env.local.example` 예외를 반드시 함께 추가해 템플릿 파일까지 무시되지 않게 한다.
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
