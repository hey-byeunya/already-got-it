import { describe, expect, it } from 'vitest'
import type { OwnedItem } from '@/types/owned-item'
import { sortOwnedItemsForList } from '@/lib/owned-item-sort'

function makeItem(overrides: Partial<OwnedItem>): OwnedItem {
  return {
    id: overrides.id ?? 'item-id',
    user_id: 'user-id',
    name: '이름',
    category: '카테고리',
    quantity: 1,
    purchased_at: '2026-01-01',
    expiry_date: null,
    memo: null,
    status: '미개봉',
    used_up_at: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

// 기준일: 2026-01-15. A~D의 D-day 표기(D-3, D-30, D+5 지남)는 전부 이 날짜 기준이다.
const TODAY = new Date('2026-01-15T00:00:00Z')

// 요청받은 검증용 예시 데이터 그대로.
const A = makeItem({ id: 'A', name: 'A', status: '미개봉', expiry_date: '2026-01-18' }) // D-3
const B = makeItem({ id: 'B', name: 'B', status: '사용중', expiry_date: '2026-02-14' }) // D-30
const C = makeItem({
  id: 'C',
  name: 'C',
  status: '미개봉',
  expiry_date: null,
  created_at: '2026-01-14T00:00:00Z', // 어제 등록
})
const D = makeItem({
  id: 'D',
  name: 'D',
  status: '사용중',
  expiry_date: '2026-01-10', // 이미 지남 (D-day로는 "경과 5일")
})
const E = makeItem({
  id: 'E',
  name: 'E',
  status: '다 씀',
  expiry_date: '2026-01-25', // D-10
  used_up_at: '2026-01-14',
})

describe('sortOwnedItemsForList — 검증용 예시(A~E)', () => {
  it('토글 OFF: 다 씀(E)은 제외하고 D → A → B → C 순으로 정렬한다', () => {
    const result = sortOwnedItemsForList([A, B, C, D, E], { includeUsedUp: false, today: TODAY })
    expect(result.map((item) => item.id)).toEqual(['D', 'A', 'B', 'C'])
  })

  it('토글 ON: 다 씀(E)을 포함하되 정렬 순서와 무관하게 항상 최하단에 고정한다', () => {
    const result = sortOwnedItemsForList([A, B, C, D, E], { includeUsedUp: true, today: TODAY })
    expect(result.map((item) => item.id)).toEqual(['D', 'A', 'B', 'C', 'E'])
  })

  it('입력 배열 순서를 뒤섞어도 결과는 동일하다 (정렬 로직 자체를 검증)', () => {
    const result = sortOwnedItemsForList([E, C, A, D, B], { includeUsedUp: true, today: TODAY })
    expect(result.map((item) => item.id)).toEqual(['D', 'A', 'B', 'C', 'E'])
  })

  it('원본 배열을 변형하지 않는 순수 함수다', () => {
    const original = [A, B, C, D, E]
    const originalOrder = original.map((item) => item.id)

    sortOwnedItemsForList(original, { includeUsedUp: true, today: TODAY })

    expect(original.map((item) => item.id)).toEqual(originalOrder)
  })
})

describe('sortOwnedItemsForList — tie-break', () => {
  it('남은 일수가 같으면 이름 가나다순으로 2차 정렬한다', () => {
    const kiwi = makeItem({ id: 'kiwi', name: '키위', expiry_date: '2026-01-20' }) // D-5
    const apple = makeItem({ id: 'apple', name: '사과', expiry_date: '2026-01-20' }) // D-5 (동일)

    const result = sortOwnedItemsForList([kiwi, apple], { includeUsedUp: false, today: TODAY })
    expect(result.map((item) => item.id)).toEqual(['apple', 'kiwi'])
  })

  it('사용기한 없는 항목끼리는 addedAt 내림차순(최근 등록 먼저)으로 정렬한다', () => {
    const older = makeItem({ id: 'older', expiry_date: null, created_at: '2026-01-01T00:00:00Z' })
    const newer = makeItem({ id: 'newer', expiry_date: null, created_at: '2026-01-14T00:00:00Z' })

    const result = sortOwnedItemsForList([older, newer], { includeUsedUp: false, today: TODAY })
    expect(result.map((item) => item.id)).toEqual(['newer', 'older'])
  })

  it('다 씀 항목이 여러 개면 그 안에서도 addedAt 내림차순으로 정렬한다', () => {
    const usedOld = makeItem({
      id: 'used-old',
      status: '다 씀',
      created_at: '2026-01-01T00:00:00Z',
      used_up_at: '2026-01-01',
    })
    const usedNew = makeItem({
      id: 'used-new',
      status: '다 씀',
      created_at: '2026-01-10T00:00:00Z',
      used_up_at: '2026-01-10',
    })

    const result = sortOwnedItemsForList([usedOld, usedNew, A], {
      includeUsedUp: true,
      today: TODAY,
    })
    expect(result.map((item) => item.id)).toEqual(['A', 'used-new', 'used-old'])
  })
})
