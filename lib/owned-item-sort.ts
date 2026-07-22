import type { OwnedItem } from '@/types/owned-item'
import { daysUntil } from '@/lib/inventory'

export interface SortOwnedItemsOptions {
  // "다 쓴 것도 보기" 토글 상태. false면 "다 씀" 항목은 결과에서 완전히 제외한다.
  includeUsedUp: boolean
  // 테스트에서 고정된 날짜로 검증할 수 있도록 주입 가능한 기준일. 생략 시 실제 오늘 날짜.
  today?: Date
}

const collator = new Intl.Collator('ko')

function compareByName(a: OwnedItem, b: OwnedItem): number {
  return collator.compare(a.name, b.name)
}

// created_at은 ISO 8601 문자열이라 문자열 비교만으로도 시간 순서가 그대로 보존된다.
function compareByAddedAtDesc(a: OwnedItem, b: OwnedItem): number {
  return b.created_at.localeCompare(a.created_at)
}

/**
 * 있템 목록 정렬(우선순위 순).
 *
 * 1. "다 씀" 항목은 기본적으로 제외한다. includeUsedUp이 true면 포함하되, 자기들끼리
 *    (addedAt 내림차순으로) 정렬한 뒤 나머지 항목들 맨 뒤에 그대로 이어붙여 — 나머지 그룹의
 *    정렬 결과와 무관하게 — 항상 최하단에 고정한다.
 * 2. 나머지(다 씀이 아닌) 항목 중 사용기한이 있는 항목: 남은 일수(오늘 - 사용기한, 음수 =
 *    이미 지남) 오름차순. 이미 지난 기한일수록 더 급하므로 최상단에 온다. 남은 일수가 같으면
 *    이름 가나다순으로 2차 정렬한다.
 * 3. 사용기한이 없는 항목은 2번 그룹 뒤에 배치하고, addedAt 내림차순(최근 등록 먼저)으로
 *    정렬한다.
 *
 * 원본 배열은 변형하지 않는다 — 모든 단계에서 필터/스프레드로 새 배열을 만든다.
 */
export function sortOwnedItemsForList(items: OwnedItem[], options: SortOwnedItemsOptions): OwnedItem[] {
  const today = options.today ?? new Date()

  const activeItems = items.filter((item) => item.status !== '다 씀')
  const usedUpItems = items.filter((item) => item.status === '다 씀')

  const withExpiry = activeItems.filter((item) => item.expiry_date !== null)
  const withoutExpiry = activeItems.filter((item) => item.expiry_date === null)

  const sortedWithExpiry = [...withExpiry].sort((a, b) => {
    // expiry_date는 바로 위에서 걸러냈으므로 이 시점에는 항상 non-null이다.
    const daysA = daysUntil(a.expiry_date as string, today)
    const daysB = daysUntil(b.expiry_date as string, today)
    if (daysA !== daysB) return daysA - daysB
    return compareByName(a, b)
  })

  const sortedWithoutExpiry = [...withoutExpiry].sort(compareByAddedAtDesc)

  const sortedActive = [...sortedWithExpiry, ...sortedWithoutExpiry]

  if (!options.includeUsedUp) return sortedActive

  const sortedUsedUp = [...usedUpItems].sort(compareByAddedAtDesc)
  return [...sortedActive, ...sortedUsedUp]
}
