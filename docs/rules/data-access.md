# 목록 조회·위시 전환 (데이터 접근)

검색·정렬 RPC와 위시→있템 원자적 전환 규칙. 목록 화면이나 Postgres 함수를 만질 때 읽는다.

## 위시리스트 → 보유템 전환

- 반드시 `mark_wishlist_purchased` 단일 Postgres RPC 함수로만 처리한다. "위시리스트 삭제 API + 보유템 생성 API"를 애플리케이션 코드에서 두 번 호출해 조합하지 않는다 — 중간에 실패하면 부분 반영 상태(하나만 반영됨)가 생길 수 있기 때문.
- 위시리스트에는 수량 개념이 없으므로 전환된 보유템의 수량은 항상 1로 설정한다.
- 위시리스트 원본에 카테고리가 없으면 NULL로 그대로 넘어가며, 이 때문에 전환 자체가 막혀서는 안 된다.

## 목록 조회 / 검색

- 검색·정렬은 `list_owned_items(p_search)` / `list_wishlist_items(p_search)` RPC로 처리한다. Supabase-js의 `.or('name.ilike...,category.ilike...')`처럼 필터 문자열을 직접 조립하지 않는다 — 검색어에 쉼표나 괄호가 들어가면 PostgREST 필터 문법이 깨질 수 있다.
- 보유템 목록은 `ORDER BY expiry_date NULLS LAST`, D-day는 저장하지 않고 조회 시점에 계산한다. RPC는 이 1차 정렬만 담당하고, "다 씀 항목 최하단 고정 + 다 쓴 것도 보기 토글" 같은 화면 전용 규칙은 클라이언트의 `lib/owned-item-sort.ts`(`sortOwnedItemsForList`)에서 순수 함수로 처리한다 — 새 정렬 규칙이 필요하면 이 함수를 확장하고, RPC의 `ORDER BY`는 그대로 둔다.
