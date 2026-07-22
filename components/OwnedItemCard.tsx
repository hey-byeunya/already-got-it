'use client'

import Link from 'next/link'
import type { OwnedItem, OwnedItemStatus } from '@/types/owned-item'
import { OWNED_ITEM_STATUSES } from '@/types/owned-item'
import { daysUntil, formatDday } from '@/lib/inventory'
import { setOwnedItemStatus } from '@/app/actions'

const STATUS_STYLE: Record<OwnedItemStatus, string> = {
  미개봉: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  사용중: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  '다 씀': 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-white/50',
}

export default function OwnedItemCard({ item }: { item: OwnedItem }) {
  const days = item.expiry_date ? daysUntil(item.expiry_date) : null
  const overdue = days !== null && days < 0

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-black/10 px-4 py-3 dark:border-white/10">
      <Link href={`/items/${item.id}`} className="min-w-0 flex-1">
        <p className="truncate font-medium">{item.name}</p>
        <p className="text-sm text-black/50 dark:text-white/50">
          {item.category ?? '미분류'} · {item.quantity}개
        </p>
      </Link>
      <div className="flex shrink-0 items-center gap-2">
        {days !== null ? (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              overdue
                ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'
                : 'bg-black/5 text-black/70 dark:bg-white/10 dark:text-white/70'
            }`}
          >
            {formatDday(days)}
          </span>
        ) : (
          <span className="text-xs text-black/40 dark:text-white/40">기한 없음</span>
        )}
        <select
          value={item.status}
          onChange={(e) => setOwnedItemStatus(item.id, e.target.value as OwnedItemStatus)}
          className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[item.status]}`}
        >
          {OWNED_ITEM_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    </li>
  )
}
