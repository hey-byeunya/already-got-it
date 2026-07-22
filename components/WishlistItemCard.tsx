'use client'

import { useState } from 'react'
import type { WishlistItem } from '@/types/wishlist-item'
import { CalendarIcon, CheckIcon, TrashIcon } from '@/components/icons'
import FormSubmitButton from '@/components/FormSubmitButton'

interface WishlistItemCardProps {
  item: WishlistItem
  onMarkPurchased: (formData: FormData) => void | Promise<void>
  onDelete: (formData: FormData) => void | Promise<void>
  onPurchaseStart: () => void
  onPurchasedAndRemoved: () => void
}

export default function WishlistItemCard({
  item,
  onMarkPurchased,
  onDelete,
  onPurchaseStart,
  onPurchasedAndRemoved,
}: WishlistItemCardProps) {
  const [leaving, setLeaving] = useState(false)

  // API 성공 응답을 받은 뒤에만 leaving을 켠다 — 실패(구매 처리 중 오류 등으로 redirect)하면
  // onMarkPurchased가 던지는 에러가 그대로 전파되어 여기 도달하지 않고, 기존 에러 처리 로직이 그대로 동작한다.
  async function handlePurchaseSubmit(formData: FormData) {
    onPurchaseStart()
    await onMarkPurchased(formData)
    setLeaving(true)
  }

  return (
    <li
      onTransitionEnd={(e) => {
        if (e.propertyName === 'grid-template-rows' && leaving) onPurchasedAndRemoved()
      }}
      className={`grid overflow-hidden rounded-2xl border bg-surface shadow-sm transition-[grid-template-rows,opacity] duration-300 ease-in ${
        leaving ? 'grid-rows-[0fr] border-transparent opacity-0' : 'grid-rows-[1fr] border-surface-border opacity-100 hover:shadow-md'
      }`}
    >
      <div className="flex min-h-0 items-stretch overflow-hidden">
        <span className="w-1.5 shrink-0 bg-accent-soft" aria-hidden />
        <div className="flex flex-1 flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate font-medium">{item.name}</p>
            {item.memo && (
              <p className="mt-0.5 break-words text-sm italic text-muted">&ldquo;{item.memo}&rdquo;</p>
            )}
            <span className="mt-1.5 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-dday-normal-bg px-2 py-0.5 text-xs text-dday-normal">
              <CalendarIcon className="h-3 w-3 shrink-0" />
              담은 날짜 {item.created_at.slice(0, 10)}
            </span>
          </div>
          <div className="flex shrink-0 items-center justify-end gap-1.5">
            <form action={onDelete}>
              <FormSubmitButton
                ariaLabel="삭제"
                title="삭제"
                className="rounded-full p-2 text-muted hover:bg-dday-overdue-bg hover:text-dday-overdue"
              >
                <TrashIcon className="h-4 w-4" />
              </FormSubmitButton>
            </form>
            <form action={handlePurchaseSubmit}>
              <FormSubmitButton className="flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-sm font-medium text-accent-foreground shadow-sm transition-colors hover:bg-accent-hover">
                <CheckIcon className="h-3.5 w-3.5" />
                구매
              </FormSubmitButton>
            </form>
          </div>
        </div>
      </div>
    </li>
  )
}
