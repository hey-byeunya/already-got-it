export interface WishlistItem {
  id: string
  user_id: string
  name: string
  category: string | null
  memo: string | null
  created_at: string
  updated_at: string
}
