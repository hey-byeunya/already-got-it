'use client'

import { useState } from 'react'
import Link from 'next/link'
import WishlistItemList from '@/components/WishlistItemList'
import type { WishlistItem } from '@/types/wishlist-item'

const EXAMPLE_WISHLIST_ITEMS: WishlistItem[] = [
  {
    id: 'preview-w1',
    user_id: 'preview-user',
    name: '립밤 신상',
    category: null,
    memo: '친구가 추천함',
    link: null,
    created_at: '2026-07-20T00:00:00Z',
    updated_at: '2026-07-20T00:00:00Z',
  },
]

export default function WishlistPreviewPage() {
  const [items, setItems] = useState(EXAMPLE_WISHLIST_ITEMS)

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="rounded-2xl border border-dashed border-accent/40 bg-accent-soft px-3.5 py-2.5 text-sm text-accent">
        예시 데이터 미리보기예요. 구매·삭제는 화면에서만 반영되고 저장되지 않아요.{' '}
        <Link href="/preview" className="underline underline-offset-2">
          있템 미리보기 →
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">위시</h1>
        <p className="mt-1 text-sm text-muted">사기 전에 한 번 더 생각할 것들</p>
      </div>
      <WishlistItemList items={items} markPurchased={removeItem} deleteItem={removeItem} />
    </div>
  )
}
