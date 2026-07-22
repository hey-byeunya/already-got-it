import WishlistItemForm from '@/components/WishlistItemForm'
import { createWishlistItem } from './actions'

export default function NewWishlistItemPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">위시 추가</h1>
      <WishlistItemForm action={createWishlistItem} />
    </div>
  )
}
