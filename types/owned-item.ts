export type OwnedItemStatus = '미개봉' | '사용중' | '다 씀'

export const OWNED_ITEM_STATUSES: OwnedItemStatus[] = ['미개봉', '사용중', '다 씀']

export interface OwnedItem {
  id: string
  user_id: string
  name: string
  category: string | null
  quantity: number
  purchased_at: string
  expiry_date: string | null
  memo: string | null
  status: OwnedItemStatus
  created_at: string
  updated_at: string
}
