'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { WishlistItem } from '@/types/wishlist-item'
import { CalendarIcon, CheckIcon, LinkIcon, TrashIcon } from '@/components/icons'
import FormSubmitButton from '@/components/FormSubmitButton'
import HintBadge from '@/components/HintBadge'

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
        leaving ? 'grid-rows-[0fr] border-transparent opacity-0' : 'grid-rows-[1fr] border-surface-border opacity-100'
      }`}
    >
      <div className="flex min-h-0 flex-col gap-4 overflow-hidden p-[18px]">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/wishlist/${item.id}`} className="min-w-0 flex-1">
            <p className="truncate font-semibold">{item.name}</p>
            {item.memo && <p className="mt-1 line-clamp-2 text-sm text-muted">{item.memo}</p>}
            <div className="mt-2 flex items-center gap-3 text-xs text-muted">
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <CalendarIcon className="h-3.5 w-3.5" />
                담은 날 {item.created_at.slice(0, 10)}
              </span>
              {item.link && (
                // <Link>가 이미 <a>를 렌더링하므로, 그 안에 또 <a>를 중첩하면 유효하지 않은
                // HTML이 되어 하이드레이션이 깨진다(실사용 중 발견) — <button>+window.open으로 대체.
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    window.open(item.link!, '_blank', 'noopener,noreferrer')
                  }}
                  title="상품 링크 열기"
                  className="text-accent hover:text-accent-hover"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </Link>
          <form action={onDelete}>
            <FormSubmitButton
              ariaLabel="삭제"
              title="삭제"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-surface-border text-muted transition-colors hover:border-dday-overdue/40 hover:bg-dday-overdue-bg hover:text-dday-overdue"
            >
              <TrashIcon className="h-4 w-4" />
            </FormSubmitButton>
          </form>
        </div>
        <div className="flex items-center gap-2">
          <form action={handlePurchaseSubmit} className="min-w-0 flex-1">
            <FormSubmitButton className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-accent py-2.5 text-sm font-bold text-accent-hover transition-colors hover:bg-accent-soft">
              <CheckIcon className="h-4 w-4" />
              샀어요 · 있템으로
            </FormSubmitButton>
          </form>
          <HintBadge id="wishlist-purchase" message="담아둔 물건을 실제로 사면 눌러서 있템으로 옮기세요." />
        </div>
      </div>
    </li>
  )
}
