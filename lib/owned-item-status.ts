import type { OwnedItem, OwnedItemStatus } from '@/types/owned-item'

// 상태 값이 무엇으로 바뀌는지에 따라 usedUpAt(다 씀으로 바뀐 날짜)을 계산한다.
// "다 씀"이 되는 순간 오늘 날짜를 기록하고, 그 외 모든 상태는 usedUpAt이 없어야 하므로
// null로 초기화한다 — 되돌리기("다 씀" → "사용중")도 이 규칙을 그대로 따른다.
export function deriveUsedUpAt(nextStatus: OwnedItemStatus, todayIso: string): string | null {
  return nextStatus === '다 씀' ? todayIso : null
}

// 수정(edit) 경로 전용: 신규 등록과 달리 "이전 상태"를 알 수 있으므로, 이미 "다 씀"이던 항목을
// 다른 필드만 고쳐 재저장하는 경우(진짜 전환이 아님)에는 기존 usedUpAt을 그대로 유지한다.
// 그렇지 않으면 매번 저장할 때마다 오늘 날짜로 덮어써져 쓴템 목록 정렬(최근 다 쓴 순)이 틀어진다.
export function deriveUsedUpAtForUpdate(
  prevStatus: OwnedItemStatus,
  nextStatus: OwnedItemStatus,
  prevUsedUpAt: string | null,
  todayIso: string
): string | null {
  if (nextStatus !== '다 씀') return null
  if (prevStatus === '다 씀') return prevUsedUpAt
  return todayIso
}

export function isUsedUpItem(item: Pick<OwnedItem, 'status'>): boolean {
  return item.status === '다 씀'
}

// 쓴템 목록 정렬: usedUpAt 최근순(내림차순). 이 목록은 항상 "다 씀" 상태 항목만 담으므로
// usedUpAt이 없는 항목은 정상적으로는 없어야 하지만, 방어적으로 뒤쪽에 배치한다.
// `?? null`로 정규화하는 이유: DB 마이그레이션 적용 전에는 PostgREST가 존재하지 않는
// 컬럼을 응답 JSON에서 아예 생략하므로 값이 null이 아니라 undefined로 들어올 수 있다 —
// `=== null` 비교만으로는 이 경우를 놓쳐 다음 줄의 localeCompare가 그대로 터진다.
export function sortByUsedUpAtDesc(items: OwnedItem[]): OwnedItem[] {
  return [...items].sort((a, b) => {
    const aDate = a.used_up_at ?? null
    const bDate = b.used_up_at ?? null
    if (aDate === null && bDate === null) return 0
    if (aDate === null) return 1
    if (bDate === null) return -1
    return bDate.localeCompare(aDate)
  })
}

export const REVERT_STATUS: OwnedItemStatus = '사용중'

// 되돌리기 버튼 클릭 시 반영할 필드 묶음: 상태를 "사용중"으로 되돌리고 usedUpAt을 초기화한다.
// 이 두 필드는 항상 함께 바뀌어야 하므로(다 씀이 아닌데 usedUpAt이 남아있는 상태가 생기면 안 됨)
// 별도 함수로 묶어 호출부에서 따로따로 갱신하다 하나를 빠뜨리는 실수를 막는다.
export function revertUsedItemFields(): { status: OwnedItemStatus; used_up_at: null } {
  return { status: REVERT_STATUS, used_up_at: null }
}
