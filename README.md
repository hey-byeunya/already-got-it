# 이미 있어

> 물욕은 인정, 관리는 앱으로 — 이미 가진 걸 까먹고 또 사는 걸 막아주는, 아주 사적인 재고 관리 도구

로그인한 사용자가 자신의 물품("있템")과 위시("위시")를 관리하는 개인용 재고 관리 웹앱입니다. 사용기한이 있는 물건은 D-day로 놓치지 않게 보여주고, 위시 항목을 구매하면 있템으로 원자적으로 옮겨줍니다. 다 쓴 물건은 "쓴템" 탭에 따로 모아 되돌아볼 수 있습니다.

## 링크

**로그인 없이 바로 체험 (예시 데이터, 저장 안 됨)**
- 있템 목록 미리보기: https://already-got-it.vercel.app/preview
- 위시 목록 미리보기: https://already-got-it.vercel.app/preview/wishlist

**실제 서비스 (로그인 필요 — 접속 시 로그인 화면으로 이동)**
- 메인(있템 목록): https://already-got-it.vercel.app
- 위시 목록: https://already-got-it.vercel.app/wishlist
- 쓴템 목록: https://already-got-it.vercel.app/used
- 있템 추가: https://already-got-it.vercel.app/items/new
- 위시 추가: https://already-got-it.vercel.app/wishlist/new

## 주요 기능

- 있템(보유템): 이름·카테고리(칩 선택)·수량(−/+ 스테퍼)·구매일·사용기한·메모·상태(미개봉/사용중/다 씀, 세그먼트 버튼) 등록·수정·삭제
- 이름·카테고리 검색, 사용기한 임박순 정렬 + D-day 배지 (임박/지남/여유/기한 없음 4단계를 색상·아이콘으로 구분)
- 위시: 이름·카테고리(있템 카테고리와 함께 칩으로 선택)·참고 링크·메모를 담아두고 등록 후에도 수정 가능, "샀어요 · 있템으로"를 누르면 있템으로 원자적 전환 (부분 반영 상태 없음), 성공이 확인된 뒤에만 카드가 사라지는 애니메이션 재생
- 쓴템: 있템을 "다 씀"으로 바꾸면 있템 목록에서는 기본적으로 숨겨지고 쓴템 탭에 모여서 보임(되돌리기 가능), 있템 목록의 "다 쓴 것도 보기" 토글을 켜면 맨 아래에 고정해서 함께 표시
- 회원가입 시 닉네임·약관동의, 로그인 화면에 비밀번호 찾기(재설정 메일 → 새 비밀번호) 전체 플로우
- 데스크톱은 좌측 고정 사이드바 + 카드 그리드, 모바일은 상단 가로 바로 접히는 반응형 레이아웃. 로그인/회원가입은 좌측 히어로 패널 + 우측 폼 2단 구성
- 로그인 화면 "이메일 저장" 체크박스 — 다음 방문 시 이메일 자동 채움 (비밀번호는 저장하지 않음)
- 로그인·등록 폼에서 Enter 키로 바로 제출 (메모 등 여러 줄 입력란은 줄바꿈 유지)
- 목록/폼 화면 로딩·제출 중 중앙 스피너 표시, 완료 후 자연스러운 전환
- 신규 가입자에게는 있템·위시 예시를 1개씩 자동으로 채워주는 온보딩
- 로그인 없이도 예시 데이터로 화면을 체험할 수 있는 `/preview` 페이지
- 로그아웃 시 클라이언트 상태·저장값을 정리하고 전체 새로고침 — 같은 브라우저에서 곧바로 다른 계정으로 로그인해도 이전 계정 데이터가 남지 않음

## 기술 스택

Next.js (App Router) · TypeScript · Supabase (Postgres + Auth + RLS) · Tailwind CSS · Vercel

## 로컬 실행 방법

1. 의존성 설치
   ```bash
   npm install
   ```
2. [supabase.com](https://supabase.com)에서 새 프로젝트 생성 (무료 티어)
3. Supabase 대시보드 > SQL Editor에서 `supabase/migration.sql` 내용을 그대로 실행
   (`owned_items`/`wishlist_items` 테이블, 인덱스, RLS 정책, `mark_wishlist_purchased`/`list_owned_items`/`list_wishlist_items`/`list_owned_categories`/`list_wishlist_categories` 함수 생성 — 이미 실행한 적이 있어도 idempotent하게 다시 실행하면 새로 추가된 컬럼·함수만 반영됨)
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

## 배포

Vercel(무료 Hobby 플랜)에 배포되어 있습니다. Server Action과 서버 세션 확인(`proxy.ts`)에 의존하는 구조라 GitHub Pages 같은 정적 호스팅으로는 배포할 수 없습니다. Vercel 프로젝트의 환경변수에는 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`(둘 다 공개 가능한 값)만 등록하고, service role key는 어디에도 사용하지 않습니다.

## 문서

- [PRD.md](./PRD.md) — 기획 배경, 기능 정의, 완성 기준
- [CLAUDE.md](./CLAUDE.md) — 개발 시 지켜야 할 규칙 (보안/RLS, 원자적 전환, 검색·정렬, UI/UX 컨벤션, 비밀값 관리)
- [openspec/changes/add-inventory-wishlist](./openspec/changes/add-inventory-wishlist) — 스펙 기반 변경 제안 (proposal/design/tasks/specs)
