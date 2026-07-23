import Link from 'next/link'
import type { OwnedItem, OwnedItemStatus } from '@/types/owned-item'
import { BoxIcon, PlusIcon } from '@/components/icons'
import { sortOwnedItemsForList } from '@/lib/owned-item-sort'
import OwnedItemCard from './OwnedItemCard'

interface OwnedItemListProps {
  items: OwnedItem[]
  hasAnyItems: boolean
  includeUsedUp: boolean
  onStatusChange?: (itemId: string, status: OwnedItemStatus) => void | Promise<void>
}

export default function OwnedItemList({ items, hasAnyItems, includeUsedUp, onStatusChange }: OwnedItemListProps) {
  const sorted = sortOwnedItemsForList(items, { includeUsedUp })

  if (sorted.length === 0 && !hasAnyItems) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-surface-border px-6 py-14 text-center">
        <span className="mb-1 flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft text-muted">
          <BoxIcon className="h-9 w-9" />
        </span>
        <p className="text-lg font-extrabold">아직 담은 있템이 없어요</p>
        <p className="text-sm leading-relaxed text-muted">
          가지고 있는 걸 등록해두면
          <br />또 사는 실수를 막을 수 있어요.
        </p>
        <Link
          href="/items/new"
          className="mt-2 flex items-center gap-1.5 rounded-2xl bg-accent px-5 py-3 text-sm font-extrabold text-accent-foreground shadow-sm transition-colors hover:bg-accent-hover"
        >
          <PlusIcon className="h-4 w-4" />
          첫 있템 추가하기
        </Link>
      </div>
    )
  }

  if (sorted.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-surface-border py-10 text-center text-sm text-muted">
        조건에 맞는 있템이 없어요.
      </p>
    )
  }

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
      {sorted.map((item) => (
        <OwnedItemCard key={item.id} item={item} onStatusChange={onStatusChange} />
      ))}
    </ul>
  )
}
