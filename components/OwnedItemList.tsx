import type { OwnedItem, OwnedItemStatus } from '@/types/owned-item'
import OwnedItemCard from './OwnedItemCard'

function sortByExpiry(items: OwnedItem[]): OwnedItem[] {
  return [...items].sort((a, b) => {
    if (a.expiry_date === null && b.expiry_date === null) return 0
    if (a.expiry_date === null) return 1
    if (b.expiry_date === null) return -1
    return a.expiry_date.localeCompare(b.expiry_date)
  })
}

interface OwnedItemListProps {
  items: OwnedItem[]
  onStatusChange?: (itemId: string, status: OwnedItemStatus) => void | Promise<void>
}

export default function OwnedItemList({ items, onStatusChange }: OwnedItemListProps) {
  const sorted = sortByExpiry(items)

  if (sorted.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-surface-border py-10 text-center text-sm text-muted">
        조건에 맞는 있템이 없어요.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {sorted.map((item) => (
        <OwnedItemCard key={item.id} item={item} onStatusChange={onStatusChange} />
      ))}
    </ul>
  )
}
