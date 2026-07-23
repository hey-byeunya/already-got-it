'use client'

import Link from 'next/link'
import type { OwnedItem, OwnedItemStatus } from '@/types/owned-item'
import { daysUntil, formatDday } from '@/lib/inventory'
import { setOwnedItemStatus } from '@/app/actions'
import { AlertIcon, HourglassIcon } from '@/components/icons'
import { StatusStepper } from '@/components/StatusStepper'

interface OwnedItemCardProps {
  item: OwnedItem
  onStatusChange?: (itemId: string, status: OwnedItemStatus) => void | Promise<void>
}

export default function OwnedItemCard({ item, onStatusChange = setOwnedItemStatus }: OwnedItemCardProps) {
  const days = item.expiry_date ? daysUntil(item.expiry_date) : null
  const overdue = days !== null && days < 0
  const urgent = days !== null && days >= 0 && days <= 7
  const finished = item.status === '다 씀'

  return (
    <li
      className={`overflow-hidden rounded-2xl border border-surface-border bg-surface p-[18px] shadow-sm ${
        finished ? 'opacity-70' : ''
      }`}
    >
      <Link href={`/items/${item.id}`} className="flex min-w-0 items-center gap-2">
        <p className="min-w-0 flex-1 truncate font-semibold">{item.name}</p>
        <span className="shrink-0 whitespace-nowrap rounded-lg bg-accent-soft px-2 py-1 text-xs font-bold text-accent">
          {item.quantity}개
        </span>
      </Link>
      <div className="mt-2 flex items-center justify-between gap-2">
        {days !== null ? (
          <span
            className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
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
          <span className="shrink-0 whitespace-nowrap rounded-full border border-dashed border-surface-border px-2.5 py-1 text-xs text-muted">
            기한 없음
          </span>
        )}
        <span className="min-w-0 truncate rounded-lg bg-background px-2 py-1 text-xs font-semibold text-muted">
          {item.category ?? '미분류'}
        </span>
      </div>
      <div className="mt-3">
        <StatusStepper status={item.status} onChange={(status) => onStatusChange(item.id, status)} />
      </div>
    </li>
  )
}
