'use client'

import Link from 'next/link'
import type { OwnedItem, OwnedItemStatus } from '@/types/owned-item'
import { daysUntil, formatDday } from '@/lib/inventory'
import { setOwnedItemStatus } from '@/app/actions'
import { AlertIcon, BoxIcon, HourglassIcon } from '@/components/icons'
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
      className={`overflow-hidden rounded-2xl border border-surface-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md ${
        finished ? 'opacity-70' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
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
      </div>
      <div className="mt-3">
        <StatusStepper status={item.status} onChange={(status) => onStatusChange(item.id, status)} />
      </div>
    </li>
  )
}
