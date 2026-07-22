import { OWNED_ITEM_STATUSES, type OwnedItemStatus } from '@/types/owned-item'
import { deriveUsedUpAt } from '@/lib/owned-item-status'
import { todayDateString } from '@/lib/inventory'

export interface OwnedItemFormValues {
  name: string
  category: string
  quantity: number
  purchased_at: string
  expiry_date: string | null
  memo: string | null
  status: OwnedItemStatus
  used_up_at: string | null
}

export function parseOwnedItemFormData(formData: FormData): OwnedItemFormValues {
  const name = String(formData.get('name') ?? '').trim()
  const category = String(formData.get('category') ?? '').trim()
  const quantityRaw = String(formData.get('quantity') ?? '')
  const purchased_at = String(formData.get('purchased_at') ?? '')
  const expiryRaw = String(formData.get('expiry_date') ?? '').trim()
  const memoRaw = String(formData.get('memo') ?? '').trim()
  const statusRaw = String(formData.get('status') ?? '')

  if (!name) throw new Error('이름을 입력해 주세요')
  if (!category) throw new Error('카테고리를 입력해 주세요')
  if (!purchased_at) throw new Error('구매일을 입력해 주세요')

  const quantity = Number(quantityRaw)
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error('수량은 1 이상의 정수여야 해요')
  }

  if (!OWNED_ITEM_STATUSES.includes(statusRaw as OwnedItemStatus)) {
    throw new Error('상태 값이 올바르지 않아요')
  }

  const status = statusRaw as OwnedItemStatus

  return {
    name,
    category,
    quantity,
    purchased_at,
    expiry_date: expiryRaw || null,
    memo: memoRaw || null,
    status,
    // 폼(등록/수정)에서 직접 상태를 "다 씀"으로 설정하는 경우에도 스테퍼와 동일한 규칙을 적용한다.
    used_up_at: deriveUsedUpAt(status, todayDateString()),
  }
}
