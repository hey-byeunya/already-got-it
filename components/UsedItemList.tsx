import type { OwnedItem } from '@/types/owned-item'
import { UndoIcon } from '@/components/icons'
import UsedItemCard from './UsedItemCard'

interface UsedItemListProps {
  items: OwnedItem[]
  revertItem: (itemId: string, formData: FormData) => void | Promise<void>
}

export default function UsedItemList({ items, revertItem }: UsedItemListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-surface-border px-6 py-14 text-center">
        <span className="mb-1 flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft text-muted">
          <UndoIcon className="h-9 w-9" />
        </span>
        <p className="text-lg font-extrabold">다 쓴 있템이 없어요</p>
        <p className="text-sm leading-relaxed text-muted">
          있템을 &ldquo;다 씀&rdquo; 상태로 바꾸면
          <br />
          여기에 모아서 보여드려요.
        </p>
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
      {items.map((item) => (
        <UsedItemCard key={item.id} item={item} onRevert={revertItem.bind(null, item.id)} />
      ))}
    </ul>
  )
}
