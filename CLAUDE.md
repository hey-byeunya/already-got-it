@AGENTS.md

# CLAUDE.md

이 파일은 이 프로젝트에서 작업할 때 **항상** 지켜야 할 규칙을 정리한다. 작업 주제별 상세 규칙은 이 파일 맨 아래 「주제별 규칙」 인덱스에서 해당 문서를 찾아 읽는다.

기능/스펙 원문은 `PRD.md`와 `openspec/changes/add-inventory-wishlist/{proposal,design,tasks}.md`, `specs/inventory/spec.md`, `specs/wishlist/spec.md`를 참고할 것. 설치·실행·배포 방법은 `README.md`에 있다.

## 프로젝트 개요

"이미 있어" — 로그인한 사용자가 보유템(물품)과 위시리스트를 관리하는 개인용 재고 관리 웹앱.
스택: Next.js (App Router) + TypeScript + Supabase (Postgres + Auth + RLS) + Tailwind CSS.

## 지켜야 할 규칙

### 보안 / 데이터 격리
- 모든 테이블은 RLS를 켜고 `user_id = auth.uid()` 정책을 건다. RLS 없이는 로그인한 누구나 모든 행을 읽을 수 있으므로, 새 테이블을 추가할 때마다 반드시 같이 추가한다.
- 3중 방어를 항상 지킨다 (RLS 하나만 믿지 않기):
  1. 모든 Server Action 최상단에서 `supabase.auth.getUser()` 확인, 없으면 즉시 에러. 클라이언트가 보낸 `user_id`는 절대 신뢰하지 않는다.
  2. 모든 select/update/delete 쿼리에 `.eq('user_id', user.id)`를 명시한다.
  3. Supabase의 update/delete는 매칭 행이 0개여도 에러 없이 조용히 성공 처리하므로, `.select()`를 붙여 반환 배열이 비어 있으면 직접 "찾을 수 없음" 에러를 던진다 — 그렇지 않으면 타인 데이터 접근 시도가 겉보기에 "성공"으로 보인다.
- 다른 계정으로 로그인했을 때 내 데이터가 전혀 보이지 않는지, 기능을 추가/수정할 때마다 직접 확인한다.

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

## 주제별 규칙 (해당 작업을 시작하기 전에 반드시 읽는다)

아래 문서들은 자동으로 로드되지 않는다. 해당 영역을 건드리기 전에 직접 열어서 읽는다.

- **폼·필드 값 규칙** (카테고리 필수 검증, 수량, status, link, `used_up_at` 파생, 카테고리 칩·상태 스테퍼 UI) → `docs/rules/fields.md`
- **인증 플로우** (회원가입 닉네임·약관동의, 비밀번호 찾기 2단계, `translateAuthError`, 인증 예외 경로) → `docs/rules/auth.md`
- **세션 격리·로그아웃** (전체 페이지 새로고침, `clearClientSessionState`, bfcache, `no-store`) → `docs/rules/session.md`
- **목록 조회·위시 전환** (검색·정렬 RPC, `sortOwnedItemsForList`, `mark_wishlist_purchased` 원자성) → `docs/rules/data-access.md`
- **UI 컨벤션·화면 레이아웃** (로딩 표시, `inputClass`/`bg-input-bg`, `secondaryAction`, 사이드바 셸, 페이지 폭) → `components/CLAUDE.md`
- **수동 QA 체크리스트** (기능 추가·변경 후 직접 확인할 항목) → `docs/manual-qa.md`
