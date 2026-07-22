'use client'

import type { OwnedItem } from '@/types/owned-item'
import { CalendarIcon, UndoIcon } from '@/components/icons'
import FormSubmitButton from '@/components/FormSubmitButton'

interface UsedItemCardProps {
  item: OwnedItem
  onRevert: (formData: FormData) => void | Promise<void>
}

export default function UsedItemCard({ item, onRevert }: UsedItemCardProps) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl border border-surface-border bg-surface p-4 shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{item.name}</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
          <span className="whitespace-nowrap rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium tracking-wide text-accent">
            {item.category ?? '미분류'}
          </span>
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <CalendarIcon className="h-3.5 w-3.5" />
            다 씀 {item.used_up_at ?? '-'}
          </span>
        </p>
      </div>
      <form action={onRevert}>
        <FormSubmitButton
          ariaLabel="있템으로 되돌리기"
          title="있템으로 되돌리기"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-accent-soft hover:text-accent"
        >
          <UndoIcon className="h-4.5 w-4.5" />
        </FormSubmitButton>
      </form>
    </li>
  )
}
