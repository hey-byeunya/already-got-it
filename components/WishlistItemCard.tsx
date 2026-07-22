import type { WishlistItem } from '@/types/wishlist-item'

interface WishlistItemCardProps {
  item: WishlistItem
  onMarkPurchased: (formData: FormData) => void | Promise<void>
  onDelete: (formData: FormData) => void | Promise<void>
}

export default function WishlistItemCard({ item, onMarkPurchased, onDelete }: WishlistItemCardProps) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-black/10 px-4 py-3 dark:border-white/10">
      <div className="min-w-0">
        <p className="truncate font-medium">{item.name}</p>
        {item.memo && (
          <p className="truncate text-sm text-black/50 dark:text-white/50">{item.memo}</p>
        )}
        <p className="text-xs text-black/35 dark:text-white/35">
          담은 날짜 {item.created_at.slice(0, 10)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <form action={onDelete}>
          <button
            type="submit"
            className="rounded-md px-2 py-1.5 text-sm text-black/40 hover:text-red-600 dark:text-white/40 dark:hover:text-red-400"
          >
            삭제
          </button>
        </form>
        <form action={onMarkPurchased}>
          <button
            type="submit"
            className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-black"
          >
            구매완료
          </button>
        </form>
      </div>
    </li>
  )
}
