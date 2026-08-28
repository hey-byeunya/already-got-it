# 폼·필드 값 규칙

있템/위시의 필드 검증·파생값·입력 UI 규칙. 등록·수정 폼이나 필드를 추가·변경할 때 읽는다.
상시 규칙(보안·비밀값)은 루트 `CLAUDE.md` 에 있다.

- `owned_items.category`: DB 컬럼은 nullable이지만, **신규 등록 폼/API에서는 필수값으로 검증**한다. (위시리스트 전환 경로는 예외 — 원본에 카테고리가 없으면 NULL 허용)
- `owned_items.quantity`: 필수, 미입력 시 기본값 1, 1 이상 정수만 허용 (0 이하·소수는 거부)
- `owned_items.status`: 미개봉/사용중/다 씀 외의 값은 거부
- `wishlist_items.link`: nullable, 선택 입력. 빈 문자열은 저장 전 `null`로 변환한다 (다른 선택 텍스트 필드와 동일 규칙)
- `owned_items.used_up_at`: nullable date. 채우기·화면 표시·수정 경로 세 규칙이 각각 다르다 — 아래 「`used_up_at` 세 규칙」을 반드시 읽는다.
- 카테고리 입력 UI: 보유템/위시 등록·수정 폼과 목록 필터는 자유 텍스트 `<input>` 대신 `components/CategoryPicker.tsx`(폼)/`components/CategoryFilter.tsx`(목록 필터)의 칩 선택 UI를 쓴다. 기존 카테고리 목록은 `list_owned_categories()`/`list_wishlist_categories()` RPC로 조회하며, 저장되는 값 자체는 여전히 자유 텍스트 문자열이다(칩은 입력 보조 UI일 뿐 검증 규칙을 바꾸지 않음). 새 폼에 카테고리 입력을 추가할 때도 이 컴포넌트를 재사용한다. **위시 등록/수정 화면(`app/wishlist/new`, `app/wishlist/[id]`)의 카테고리 칩은 `list_wishlist_categories()`와 `list_owned_categories()`를 둘 다 조회해 합집합으로 보여준다** — 위시가 비어 있는 초기 상태에도 있템 쪽 카테고리를 재사용할 수 있게 하기 위함이며, 있템 쪽은 반대로 위시 카테고리를 섞지 않는다(비대칭이 의도된 동작)
- 상태 입력/표시 UI: `components/StatusStepper.tsx`의 `StatusStepper`(목록 카드용 진행형 바)/`StatusSegmentedControl`(폼용 3분할 버튼)을 재사용한다. 선택값은 `<input type="hidden" name="status">`로 기존 서버 액션 시그니처 변경 없이 제출된다

## `used_up_at` 세 규칙

원래 한 문단이었는데, 신규 등록과 수정의 차이가 문단에 묻혀 실제로 버그가 났던 곳이라 셋으로 나눠 적는다.

### 1. 값 채우기·되돌리기 (파생)

`owned_items.used_up_at` 은 nullable date. 상태가 "다 씀"으로 바뀌는 순간에만 오늘 날짜로 채우고, 그 외 모든 상태로 바뀔 때(되돌리기 포함)는 반드시 `null`로 되돌린다 — `lib/owned-item-status.ts`의 `deriveUsedUpAt`/`revertUsedItemFields`로만 계산하고 직접 조립하지 않는다.

### 2. 화면 표시는 `updated_at` 을 쓴다

**화면에 "다 씀으로 바뀐 날짜"를 표시할 때는 `used_up_at`이 아니라 `item.updated_at`을 쓴다** (`components/UsedItemCard.tsx`) — `used_up_at`은 마이그레이션 적용 여부에 따라 값이 없을 수 있는 반면 `updated_at`은 테이블 생성 시점부터 항상 존재하고 트리거로 보장되는 필드라 더 안정적이다.

### 3. 수정(edit) 경로는 신규 등록과 다르다

**수정(edit) 경로는 신규 등록과 다르게 처리한다**: 이미 "다 씀"인 항목을 다른 필드만 고쳐 재저장해도 상태 자체는 바뀌지 않으므로, 이 경우 `used_up_at`을 오늘 날짜로 다시 덮어쓰지 않고 기존 값을 유지해야 한다 — `lib/owned-item-status.ts`의 `deriveUsedUpAtForUpdate(prevStatus, nextStatus, prevUsedUpAt, today)`로 계산하고(`app/items/[id]/actions.ts`가 수정 전 기존 `status`/`used_up_at`을 먼저 조회해서 넘김), 신규 등록(`app/items/new/actions.ts`)은 이전 상태가 없으므로 계속 단순한 `deriveUsedUpAt`을 쓴다.
