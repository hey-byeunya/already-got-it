'use client'

import Link from 'next/link'
import type { OwnedItem, OwnedItemStatus } from '@/types/owned-item'
import { OWNED_ITEM_STATUSES } from '@/types/owned-item'
import { daysUntil, formatDday } from '@/lib/inventory'
import { setOwnedItemStatus } from '@/app/actions'
import { AlertIcon, BoxIcon, ChevronDownIcon, HourglassIcon } from '@/components/icons'

const STATUS_STYLE: Record<OwnedItemStatus, { dot: string; chip: string; spine: string }> = {
  미개봉: {
    dot: 'bg-status-sealed',
    chip: 'bg-status-sealed-bg text-status-sealed',
    spine: 'bg-status-sealed',
  },
  사용중: {
    dot: 'bg-status-active',
    chip: 'bg-status-active-bg text-status-active',
    spine: 'bg-status-active',
  },
  '다 씀': {
    dot: 'bg-status-done',
    chip: 'bg-status-done-bg text-status-done',
    spine: 'bg-status-done',
  },
}

interface OwnedItemCardProps {
  item: OwnedItem
  onStatusChange?: (itemId: string, status: OwnedItemStatus) => void | Promise<void>
}

export default function OwnedItemCard({ item, onStatusChange = setOwnedItemStatus }: OwnedItemCardProps) {
  const days = item.expiry_date ? daysUntil(item.expiry_date) : null
  const overdue = days !== null && days < 0
  const urgent = days !== null && days >= 0 && days <= 7
  const status = STATUS_STYLE[item.status]
  const finished = item.status === '다 씀'

  return (
    <li
      className={`flex items-stretch gap-0 overflow-hidden rounded-2xl border border-surface-border bg-surface shadow-sm transition-shadow hover:shadow-md ${
        finished ? 'opacity-70' : ''
      }`}
    >
      <span className={`w-1.5 shrink-0 ${status.spine}`} aria-hidden />
      <div className="flex flex-1 flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href={`/items/${item.id}`} className="min-w-0 flex-1">
          <p className="truncate font-medium">{item.name}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <span className="whitespace-nowrap rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium tracking-wide text-accent">
              {item.category ?? '미분류'}
            </span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <BoxIcon className="h-3.5 w-3.5" />
              {item.quantity}
            </span>
          </p>
        </Link>
        <div className="flex shrink-0 items-center justify-end gap-2">
          {days !== null ? (
            <span
              className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                overdue
                  ? 'bg-dday-overdue-bg text-dday-overdue'
                  : urgent
                    ? 'bg-dday-urgent-bg text-dday-urgent'
                    : 'bg-dday-normal-bg text-dday-normal'
              }`}
            >
              {overdue ? (
                <AlertIcon className="h-3.5 w-3.5 shrink-0" />
              ) : urgent ? (
                <HourglassIcon className="h-3.5 w-3.5 shrink-0" />
              ) : null}
              {formatDday(days)}
            </span>
          ) : (
            <span className="whitespace-nowrap rounded-full border border-dashed border-surface-border px-2.5 py-1 text-xs text-muted">
              기한 없음
            </span>
          )}
          <div className={`relative flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full pl-2.5 pr-1.5 py-1 text-xs font-semibold ${status.chip}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden />
            <select
              value={item.status}
              onChange={(e) => onStatusChange(item.id, e.target.value as OwnedItemStatus)}
              className="appearance-none bg-transparent pr-4 outline-none"
              aria-label="상태 변경"
            >
              {OWNED_ITEM_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2" />
          </div>
        </div>
      </div>
    </li>
  )
}
