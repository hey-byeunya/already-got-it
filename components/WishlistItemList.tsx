'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { WishlistItem } from '@/types/wishlist-item'
import { GiftIcon, PlusIcon } from '@/components/icons'
import WishlistItemCard from './WishlistItemCard'

interface WishlistItemListProps {
  items: WishlistItem[]
  markPurchased: (itemId: string, formData: FormData) => void | Promise<void>
  deleteItem: (itemId: string, formData: FormData) => void | Promise<void>
}

export default function WishlistItemList({ items: itemsProp, markPurchased, deleteItem }: WishlistItemListProps) {
  const [items, setItems] = useState(itemsProp)
  // 구매 성공 후 퇴장 애니메이션이 재생 중인 항목 id. 서버에서 새 목록이 먼저 도착해도
  // 이 목록에 있는 항목은 애니메이션이 끝날 때까지 화면에서 미리 지우지 않는다.
  const animatingIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    setItems((prev) => {
      const stillAnimating = prev.filter(
        (item) => animatingIds.current.has(item.id) && !itemsProp.some((i) => i.id === item.id)
      )
      return [...itemsProp, ...stillAnimating]
    })
  }, [itemsProp])

  function handlePurchaseStart(itemId: string) {
    animatingIds.current.add(itemId)
  }

  function handlePurchasedAndRemoved(itemId: string) {
    animatingIds.current.delete(itemId)
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-surface-border px-6 py-14 text-center">
        <span className="mb-1 flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft text-muted">
          <GiftIcon className="h-9 w-9" />
        </span>
        <p className="text-lg font-extrabold">위시리스트가 비었어요</p>
        <p className="text-sm leading-relaxed text-muted">
          사고 싶은 걸 담아두고
          <br />
          정말 필요한지 천천히 생각해봐요.
        </p>
        <Link
          href="/wishlist/new"
          className="mt-2 flex items-center gap-1.5 rounded-2xl bg-accent px-5 py-3 text-sm font-extrabold text-accent-foreground shadow-sm transition-colors hover:bg-accent-hover"
        >
          <PlusIcon className="h-4 w-4" />
          위시 담기
        </Link>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <WishlistItemCard
          key={item.id}
          item={item}
          onMarkPurchased={markPurchased.bind(null, item.id)}
          onDelete={deleteItem.bind(null, item.id)}
          onPurchaseStart={() => handlePurchaseStart(item.id)}
          onPurchasedAndRemoved={() => handlePurchasedAndRemoved(item.id)}
        />
      ))}
    </ul>
  )
}
