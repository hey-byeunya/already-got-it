## 1. 데이터베이스 스키마

- [ ] 1.1 `owned_items` 테이블 생성 (id, user_id, name, category, quantity(정수, 기본값 1, 1 이상 제약), purchased_at, expiry_date NULL 허용, memo NULL 허용, status enum[미개봉/사용중/다 씀], created_at, updated_at)
- [ ] 1.2 `wishlist_items` 테이블 생성 (id, user_id, name, category NULL 허용, memo NULL 허용, created_at, updated_at)
- [ ] 1.3 두 테이블에 `expiry_date`(owned_items), `(user_id, name, category)` 검색용 인덱스 추가
- [ ] 1.4 두 테이블에 Row Level Security 활성화 및 `user_id = auth.uid()` 기반 SELECT/INSERT/UPDATE/DELETE 정책 작성

## 2. 구매완료 원자적 전환

- [ ] 2.1 `mark_wishlist_purchased(wishlist_item_id)` PL-pgSQL 함수 작성: 대상 항목 존재/소유자 확인 → 없으면 예외 발생 → 있으면 단일 트랜잭션 내에서 `wishlist_items` 삭제 + `owned_items` 삽입(구매일=오늘, 상태=미개봉, 수량=1)
- [ ] 2.2 함수 호출을 위한 RPC 엔드포인트 연결 및 성공 시 생성된 보유템 반환
- [ ] 2.3 이미 삭제되었거나 존재하지 않는 항목에 대한 재요청 시 오류 반환 및 중복 생성 방지 검증

## 3. 보유템 API

- [ ] 3.1 보유템 등록 API (이름/카테고리/수량/구매일/상태 필수, 사용기한/메모 선택; 수량 미입력 시 기본값 1) + 상태 값 검증(미개봉/사용중/다 씀 외 거부) + 수량 값 검증(1 이상 정수 외 거부)
- [ ] 3.2 보유템 수정 API (이름/카테고리/수량/구매일/사용기한/메모/상태 갱신)
- [ ] 3.3 보유템 삭제 API
- [ ] 3.4 보유템 목록 조회 API: `expiry_date NULLS LAST` 정렬 + D-day 계산(오늘 기준 남은/경과 일수) 포함 응답
- [ ] 3.5 보유템 목록 조회에 이름/카테고리 검색 파라미터(대소문자 무시 부분일치) 추가

## 4. 위시리스트 API

- [ ] 4.1 위시리스트 등록 API (이름 필수, 카테고리/메모 선택)
- [ ] 4.2 위시리스트 삭제 API
- [ ] 4.3 위시리스트 목록 조회 API + 이름/카테고리 검색 파라미터
- [ ] 4.4 위시리스트 '구매완료' 처리 API를 2절의 RPC 함수와 연결

## 5. 인증 및 인가

- [ ] 5.1 보유템/위시리스트 API 전 구간에 인증 미들웨어(비로그인 요청 거부) 적용
- [ ] 5.2 API 레이어에서도 요청 사용자와 리소스 소유자 일치 여부 확인(방어적 이중 검증, RLS와 별개로)

## 6. 테스트

- [ ] 6.1 타인의 보유템/위시리스트 항목에 대한 조회·수정·삭제·구매완료 시도가 모두 차단되는지 검증하는 테스트 작성
- [ ] 6.2 구매완료 처리 중 보유템 생성 실패를 강제로 유발해 위시리스트 항목이 롤백되어 남아있는지(부분 반영 없음) 검증하는 테스트 작성
- [ ] 6.3 사용기한 있음/없음이 섞인 목록의 정렬 순서 및 D-day 값 계산 테스트 작성
- [ ] 6.4 이름/카테고리 검색이 대소문자 무시 부분일치로 동작하는지 테스트 작성
- [ ] 6.5 이미 처리된 위시리스트 항목에 대한 구매완료 재요청이 중복 보유템을 생성하지 않는지 테스트 작성

## 7. 검증

- [ ] 7.1 `openspec validate add-inventory-wishlist --strict` 통과 확인
- [ ] 7.2 specs/inventory, specs/wishlist의 모든 시나리오가 구현과 테스트로 커버되는지 교차 확인
