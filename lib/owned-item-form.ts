import { OWNED_ITEM_STATUSES, type OwnedItemStatus } from '@/types/owned-item'

export interface OwnedItemFormValues {
  name: string
  category: string
  quantity: number
  purchased_at: string
  expiry_date: string | null
  memo: string | null
  status: OwnedItemStatus
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

  return {
    name,
    category,
    quantity,
    purchased_at,
    expiry_date: expiryRaw || null,
    memo: memoRaw || null,
    status: statusRaw as OwnedItemStatus,
  }
}
