# 이미 있어

> 물욕은 인정, 관리는 앱으로 — 이미 가진 걸 까먹고 또 사는 걸 막아주는, 아주 사적인 재고 관리 도구

로그인한 사용자가 자신의 물품("있템")과 위시("위시")를 관리하는 개인용 재고 관리 웹앱입니다. 사용기한이 있는 물건은 D-day로 놓치지 않게 보여주고, 위시 항목을 구매하면 있템으로 원자적으로 옮겨줍니다.

## 링크

- **실제 서비스**: https://already-got-it.vercel.app (로그인/회원가입 필요)
- **미리보기**: https://already-got-it.vercel.app/preview (로그인 없이 예시 데이터로 화면만 체험 — 저장되지 않음)

## 주요 기능

- 있템(보유템): 이름·카테고리(자유 입력)·수량·구매일·사용기한·메모·상태(미개봉/사용중/다 씀) 등록·수정·삭제
- 이름·카테고리 검색, 사용기한 임박순 정렬 + D-day 배지 (임박/지남/여유/기한 없음 4단계를 색상·아이콘으로 구분)
- 위시: 이름·메모를 담아두고 "구매"를 누르면 있템으로 원자적 전환 (부분 반영 상태 없음)
- 로그인/회원가입 화면 분리, 이메일 형식·비밀번호 확인 검증, 실패 원인별 한국어 안내
- 신규 가입자에게는 있템·위시 예시를 1개씩 자동으로 채워주는 온보딩
- 로그인 없이도 예시 데이터로 화면을 체험할 수 있는 `/preview` 페이지

## 기술 스택

Next.js (App Router) · TypeScript · Supabase (Postgres + Auth + RLS) · Tailwind CSS · Vercel

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

## 배포

Vercel(무료 Hobby 플랜)에 배포되어 있습니다. Server Action과 서버 세션 확인(`proxy.ts`)에 의존하는 구조라 GitHub Pages 같은 정적 호스팅으로는 배포할 수 없습니다. Vercel 프로젝트의 환경변수에는 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`(둘 다 공개 가능한 값)만 등록하고, service role key는 어디에도 사용하지 않습니다.

## 문서

- [PRD.md](./PRD.md) — 기획 배경, 기능 정의, 완성 기준
- [CLAUDE.md](./CLAUDE.md) — 개발 시 지켜야 할 규칙 (보안/RLS, 원자적 전환, 검색·정렬, 비밀값 관리)
- [openspec/changes/add-inventory-wishlist](./openspec/changes/add-inventory-wishlist) — 스펙 기반 변경 제안 (proposal/design/tasks/specs)
