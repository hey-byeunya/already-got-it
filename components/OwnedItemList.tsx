import type { OwnedItem } from '@/types/owned-item'
import OwnedItemCard from './OwnedItemCard'

function sortByExpiry(items: OwnedItem[]): OwnedItem[] {
  return [...items].sort((a, b) => {
    if (a.expiry_date === null && b.expiry_date === null) return 0
    if (a.expiry_date === null) return 1
    if (b.expiry_date === null) return -1
    return a.expiry_date.localeCompare(b.expiry_date)
  })
}

export default function OwnedItemList({ items }: { items: OwnedItem[] }) {
  const sorted = sortByExpiry(items)

  if (sorted.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-black/40 dark:text-white/40">
        조건에 맞는 보유템이 없어요.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {sorted.map((item) => (
        <OwnedItemCard key={item.id} item={item} />
      ))}
    </ul>
  )
}
