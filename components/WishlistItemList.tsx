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
      <p className="py-8 text-center text-sm text-black/40 dark:text-white/40">
        위시리스트가 비어 있어요.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
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
