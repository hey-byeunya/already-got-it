import { describe, expect, it } from 'vitest'
import type { OwnedItem } from '@/types/owned-item'
import {
  deriveUsedUpAt,
  isUsedUpItem,
  revertUsedItemFields,
  sortByUsedUpAtDesc,
} from '@/lib/owned-item-status'

function makeItem(overrides: Partial<OwnedItem>): OwnedItem {
  return {
    id: 'item-id',
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

describe('deriveUsedUpAt', () => {
  it('상태가 "다 씀"이 되면 오늘 날짜를 기록한다', () => {
    expect(deriveUsedUpAt('다 씀', '2026-07-22')).toBe('2026-07-22')
  })

  it('상태가 "다 씀"이 아니면 항상 null이다 (미개봉/사용중 모두)', () => {
    expect(deriveUsedUpAt('미개봉', '2026-07-22')).toBeNull()
    expect(deriveUsedUpAt('사용중', '2026-07-22')).toBeNull()
  })
})

describe('sortByUsedUpAtDesc', () => {
  it('usedUpAt 최근순(내림차순)으로 정렬한다 — F(07-20) → G(07-15)', () => {
    const f = makeItem({ id: 'F', name: 'F', status: '다 씀', used_up_at: '2026-07-20' })
    const g = makeItem({ id: 'G', name: 'G', status: '다 씀', used_up_at: '2026-07-15' })

    expect(sortByUsedUpAtDesc([g, f]).map((item) => item.id)).toEqual(['F', 'G'])
    expect(sortByUsedUpAtDesc([f, g]).map((item) => item.id)).toEqual(['F', 'G'])
  })

  it('usedUpAt이 없는 항목(비정상 데이터)은 뒤로 보낸다', () => {
    const withDate = makeItem({ id: 'has-date', status: '다 씀', used_up_at: '2026-07-15' })
    const withoutDate = makeItem({ id: 'no-date', status: '다 씀', used_up_at: null })

    expect(sortByUsedUpAtDesc([withoutDate, withDate]).map((item) => item.id)).toEqual([
      'has-date',
      'no-date',
    ])
  })

  it('usedUpAt이 undefined로 와도(DB 마이그레이션 미적용 등) 터지지 않는다', () => {
    const withDate = makeItem({ id: 'has-date', status: '다 씀', used_up_at: '2026-07-15' })
    // PostgREST는 존재하지 않는 컬럼을 응답에서 아예 생략하므로, 마이그레이션 적용 전에는
    // used_up_at 값이 null이 아니라 undefined로 들어올 수 있다 — 실제 라이브 환경에서 재현된 케이스.
    const undefinedDate = makeItem({ id: 'undefined-date', status: '다 씀' })
    undefinedDate.used_up_at = undefined as unknown as string | null

    expect(() => sortByUsedUpAtDesc([undefinedDate, withDate])).not.toThrow()
    expect(sortByUsedUpAtDesc([undefinedDate, withDate]).map((item) => item.id)).toEqual([
      'has-date',
      'undefined-date',
    ])
  })
})

describe('되돌리기 (revert)', () => {
  it('F를 되돌리면 상태는 "사용중", usedUpAt은 null로 초기화된다', () => {
    const f = makeItem({ id: 'F', status: '다 씀', used_up_at: '2026-07-20' })

    const reverted: OwnedItem = { ...f, ...revertUsedItemFields() }

    expect(reverted.status).toBe('사용중')
    expect(reverted.used_up_at).toBeNull()
  })

  it('F를 되돌린 뒤에는 쓴템 목록(다 씀 필터)에서 사라지고, G만 남는다', () => {
    const f = makeItem({ id: 'F', status: '다 씀', used_up_at: '2026-07-20' })
    const g = makeItem({ id: 'G', status: '다 씀', used_up_at: '2026-07-15' })

    const revertedF: OwnedItem = { ...f, ...revertUsedItemFields() }
    const usedItemsAfterRevert = sortByUsedUpAtDesc([revertedF, g].filter(isUsedUpItem))

    expect(usedItemsAfterRevert.map((item) => item.id)).toEqual(['G'])
  })
})
