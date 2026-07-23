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

  const status = statusRaw as OwnedItemStatus

  return {
    name,
    category,
    quantity,
    purchased_at,
    expiry_date: expiryRaw || null,
    memo: memoRaw || null,
    status,
    // used_up_at은 여기서 계산하지 않는다 — 신규 등록과 수정은 "이전 상태"를 아는지가 달라
    // 각 서버 액션(createOwnedItem/updateOwnedItem)이 직접 계산한다.
  }
}
