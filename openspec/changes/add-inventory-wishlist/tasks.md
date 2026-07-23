## 1. 데이터베이스 스키마

- [x] 1.1 `owned_items` 테이블 생성 (id, user_id, name, category, quantity(정수, 기본값 1, 1 이상 제약), purchased_at, expiry_date NULL 허용, memo NULL 허용, status enum[미개봉/사용중/다 씀], created_at, updated_at)
- [x] 1.2 `wishlist_items` 테이블 생성 (id, user_id, name, category NULL 허용, memo NULL 허용, created_at, updated_at)
- [x] 1.3 두 테이블에 `expiry_date`(owned_items), `(user_id, name, category)` 검색용 인덱스 추가
- [x] 1.4 두 테이블에 Row Level Security 활성화 및 `user_id = auth.uid()` 기반 SELECT/INSERT/UPDATE/DELETE 정책 작성 — `wishlist_items`는 실사용 중 UPDATE 정책 누락이 발견되어 추가함(2.3 참고)

## 2. 구매완료 원자적 전환

- [x] 2.1 `mark_wishlist_purchased(wishlist_item_id)` PL-pgSQL 함수 작성: 대상 항목 존재/소유자 확인 → 없으면 예외 발생 → 있으면 단일 트랜잭션 내에서 `wishlist_items` 삭제 + `owned_items` 삽입(구매일=오늘, 상태=미개봉, 수량=1)
- [x] 2.2 함수 호출을 위한 RPC 엔드포인트 연결 및 성공 시 생성된 보유템 반환
- [x] 2.3 이미 삭제되었거나 존재하지 않는 항목에 대한 재요청 시 오류 반환 및 중복 생성 방지 검증 — 배포 후 실사용 중 구매 처리가 항상 실패하는 버그 발견: `wishlist_items`에 UPDATE 정책이 없어 함수 내부의 `select ... for update`가 Postgres RLS 규칙상 항상 0건을 반환했음. `wishlist_items_update_own` 정책(자기 행에 한해 update 허용) 추가로 수정

## 3. 보유템 API

- [x] 3.1 보유템 등록 API (이름/카테고리/수량/구매일/상태 필수, 사용기한/메모 선택; 수량 미입력 시 기본값 1) + 상태 값 검증(미개봉/사용중/다 씀 외 거부) + 수량 값 검증(1 이상 정수 외 거부)
- [x] 3.2 보유템 수정 API (이름/카테고리/수량/구매일/사용기한/메모/상태 갱신)
- [x] 3.3 보유템 삭제 API
- [x] 3.4 보유템 목록 조회 API: `expiry_date NULLS LAST` 정렬 + D-day 계산(오늘 기준 남은/경과 일수) 포함 응답
- [x] 3.5 보유템 목록 조회에 이름/카테고리 검색 파라미터(대소문자 무시 부분일치) 추가

## 4. 위시리스트 API

- [x] 4.1 위시리스트 등록 API (이름 필수, 카테고리/메모 선택)
- [x] 4.2 위시리스트 삭제 API
- [x] 4.3 위시리스트 목록 조회 API + 이름/카테고리 검색 파라미터
- [x] 4.4 위시리스트 '구매완료' 처리 API를 2절의 RPC 함수와 연결

## 5. 인증 및 인가

- [x] 5.1 보유템/위시리스트 API 전 구간에 인증 미들웨어(비로그인 요청 거부) 적용 — `proxy.ts` + 각 Server Action/페이지의 `auth.getUser()` 확인
- [x] 5.2 API 레이어에서도 요청 사용자와 리소스 소유자 일치 여부 확인(방어적 이중 검증, RLS와 별개로) — 모든 select/update/delete에 `.eq('user_id', user.id)` 명시

## 6. 테스트

- [ ] 6.1 타인의 보유템/위시리스트 항목에 대한 조회·수정·삭제·구매완료 시도가 모두 차단되는지 검증하는 테스트 작성
- [ ] 6.2 구매완료 처리 중 보유템 생성 실패를 강제로 유발해 위시리스트 항목이 롤백되어 남아있는지(부분 반영 없음) 검증하는 테스트 작성
- [ ] 6.3 사용기한 있음/없음이 섞인 목록의 정렬 순서 및 D-day 값 계산 테스트 작성
- [ ] 6.4 이름/카테고리 검색이 대소문자 무시 부분일치로 동작하는지 테스트 작성
- [ ] 6.5 이미 처리된 위시리스트 항목에 대한 구매완료 재요청이 중복 보유템을 생성하지 않는지 테스트 작성

자동화 테스트(6.1~6.5)는 아직 작성되지 않았다. 대신 배포된 실제 환경에서 각 시나리오를 수동으로 검증했다 (다른 계정으로 접근 차단 확인, 구매 처리 성공/실패 확인 등) — 자동화는 남은 작업으로 유지한다.

## 7. 검증

- [x] 7.1 `openspec validate add-inventory-wishlist --strict` 통과 확인
- [x] 7.2 specs/inventory, specs/wishlist의 모든 시나리오가 구현과 테스트로 커버되는지 교차 확인 — 수동 시나리오 검증으로 커버 (6절 참고)

## 8. UX 폴리시 (후속 라운드)

- [x] 8.1 로그인 화면 "이메일 저장" 체크박스: `localStorage`에 이메일만 저장(비밀번호 제외), 다음 방문 시 자동 채움
- [x] 8.2 로그인/보유템/위시 폼에서 Enter 키로 제출 (네이티브 `<form>` + `type="submit"` 조합으로 별도 핸들러 없이 처리, textarea는 제외)
- [x] 8.3 목록/폼 화면 로딩 중 중앙 스피너 표시(`loading.tsx` + `PendingOverlay`) 및 콘텐츠 fade-in
- [x] 8.4 위시 구매 성공 시에만(실패 시 애니메이션 없음) 카드 fade-out + 높이 축소 애니메이션
- [x] 8.5 보유템 수량 입력을 −/+ 스테퍼로 변경, 최소값 1 보정

## 9. Claude Design 리디자인 (후속 라운드)

- [x] 9.1 Claude Design 목업(`이미 있어 리디자인.dc.html`) 에셋(로고) 다운로드, 디자인 토큰(틸 그린 #00a090)·Pretendard 폰트 교체
- [x] 9.2 Header를 프로필 아바타 + 드롭다운(닉네임/이메일 표시, 로그아웃) 구조로 개편
- [x] 9.3 회원가입에 닉네임(2~20자 검증)·약관동의 체크박스 추가, `signUp` 시 `user_metadata.nickname` 저장
- [x] 9.4 비밀번호 찾기 플로우 신설: `/forgot-password`(재설정 메일 요청) → `/reset-password`(새 비밀번호 설정), `proxy.ts`에 비로그인 허용 경로로 등록
- [x] 9.5 `list_owned_categories`/`list_wishlist_categories` RPC 신설, 보유템/위시 등록·수정 폼과 목록 필터의 카테고리 입력을 칩 선택 UI(`CategoryPicker`/`CategoryFilter`)로 전환
- [x] 9.6 보유템 상태 입력·표시를 3단계 세그먼트 스텝퍼(`StatusStepper`/`StatusSegmentedControl`)로 전환
- [x] 9.7 `wishlist_items.link` 컬럼 추가, 등록/수정 폼에 참고 링크 입력 추가, 위시리스트 항목 수정 화면(`/wishlist/[id]`) 신설(등록 폼과 동일한 소유권 검증 패턴 재사용)
- [x] 9.8 목록 빈 상태를 아이콘 + 헤드라인 + 설명 + CTA 버튼 형태로 재작성 (보유템/위시 각각 `/items/new`, `/wishlist/new`로 연결)
- [x] 9.9 `openspec validate add-inventory-wishlist --strict` 통과 확인, `PRD.md`/`CLAUDE.md`에 신규 기능·컨벤션 반영
- [x] 9.10 `npx tsc --noEmit` + `npx eslint .` 전체 통과 확인, 비로그인 미리보기 화면(`/preview`, `/preview/wishlist`) 브라우저 검증 — 닉네임 가입/비밀번호 찾기/위시 수정/프로필 메뉴 등 로그인 필요 화면은 비밀번호 대리 입력이 불가능하므로 사용자 직접 확인 필요

## 10. 쓴템 탭 + 세션 보안 (후속 라운드)

- [x] 10.1 `owned_items.used_up_at`(date, nullable) 컬럼 추가. `deriveUsedUpAt`/`revertUsedItemFields`(`lib/owned-item-status.ts`)로 상태 전이 시 값 계산 — "다 씀"이 될 때만 오늘 날짜, 그 외엔 null
- [x] 10.2 "쓴템" 탭(`/used`) 신설: 다 씀 상태 항목만 조회해 표시, 되돌리기 버튼(`revertUsedItem` 서버 액션)으로 "사용중" 상태 + `used_up_at` null 복귀
- [x] 10.3 순수 정렬 함수 `sortOwnedItemsForList`(`lib/owned-item-sort.ts`) 작성: 사용기한 임박순 → 사용기한 없음(등록 최근순) → 다 씀(토글 시 노출, 항상 최하단·자기들끼리 상태변경 최근순). 있템 목록에 "다 쓴 것도 보기" 토글 연결
- [x] 10.4 vitest 도입, 정렬 함수·상태 전이 로직에 대한 단위 테스트 작성(사용자가 제시한 검증 시나리오 포함)
- [x] 10.5 로그아웃 시 클라이언트 상태·`localStorage`/`sessionStorage`(이메일 저장 값 제외) 정리 후 전체 페이지 새로고침(`lib/client-session.ts`, `components/ProfileMenu.tsx`)
- [x] 10.6 서버 액션의 `!user` 처리를 `throw`에서 `redirect('/login')`으로 통일(세션 만료 시 에러 화면 대신 로그인 이동)
- [x] 10.7 `components/BfcacheGuard.tsx` 신설(뒤로가기 bfcache 복원 감지 시 강제 새로고침), `lib/supabase/proxy.ts` 응답에 `Cache-Control: no-store` 강제
- [x] 10.8 쓴템 목록 카드의 표시 날짜를 `used_up_at`이 아니라 `item.updated_at`으로 변경 — 마이그레이션 미적용 환경에서도 항상 존재하는 필드라 더 안정적(실사용 중 발견)

## 11. 데스크톱 리디자인 v2 (Claude Design v2 목업 기반, 후속 라운드)

- [x] 11.1 `components/Sidebar.tsx` 신설(데스크톱 좌측 고정/모바일 상단 가로 바 반응형, 있템·위시·쓴템 네비), `components/Header.tsx` 삭제, `app/layout.tsx`를 사이드바+콘텐츠 flex 레이아웃으로 재구성
- [x] 11.2 `components/ProfileMenu.tsx`를 사이드바 하단 프로필 카드 형태로 재스타일(로그아웃 로직 불변)
- [x] 11.3 있템/위시/쓴템 목록을 세로 리스트에서 카드 그리드로 전환, 카드 내부 레이아웃 재배치(D-day 색상 배지 로직은 유지)
- [x] 11.4 위시 카드의 "구매" 버튼을 "샀어요 · 있템으로"로 개칭 + 카드 하단 전체너비 버튼으로 이동(기존 애니메이션/서버 액션 로직 재사용)
- [x] 11.5 `list_owned_categories`/`list_wishlist_categories`를 함께 조회해 위시 카테고리 칩에 합집합으로 노출(위시 전용, 있템은 비대칭 유지)
- [x] 11.6 로그인/회원가입을 `AuthHeroPanel`+`AuthScreen`+`AuthForm`(mode를 prop으로 전환) 2단 카드로 재구성
- [x] 11.7 폼 필드 나란히 배치(수량+구매일, 사용기한+메모), 저장+삭제 버튼을 `secondaryAction` prop으로 같은 줄에 배치(별도 flex 컬럼 분할 방식은 빈 공간이 어색해 보여 폐기)
- [x] 11.8 `--input-bg` 토큰 신설 + 있템/위시 추가·수정 화면에 흰 카드 래퍼 추가, 카테고리 칩·수량 스테퍼 등 폼 컨트롤 배경 대비 개선
- [x] 11.9 `openspec validate add-inventory-wishlist --strict` 통과 확인, `PRD.md`/`CLAUDE.md`/`README.md`에 신규 기능·컨벤션 반영
- [x] 11.10 `npx tsc --noEmit` + `npx eslint .` + `npm test` 전체 통과 확인, 실제 로그인 브라우저로 사이드바/카드 그리드/폼 카드/로그인 히어로 패널/반응형 접힘 검증
