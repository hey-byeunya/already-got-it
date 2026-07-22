import type { WishlistItem } from '@/types/wishlist-item'
import WishlistItemCard from './WishlistItemCard'

interface WishlistItemListProps {
  items: WishlistItem[]
  markPurchased: (itemId: string, formData: FormData) => void | Promise<void>
  deleteItem: (itemId: string, formData: FormData) => void | Promise<void>
}

export default function WishlistItemList({ items, markPurchased, deleteItem }: WishlistItemListProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-surface-border py-10 text-center text-sm text-muted">
        위시가 비어 있어요.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <WishlistItemCard
          key={item.id}
          item={item}
          onMarkPurchased={markPurchased.bind(null, item.id)}
          onDelete={deleteItem.bind(null, item.id)}
        />
      ))}
    </ul>
  )
}
