'use client'

import { useEffect, useRef, useState } from 'react'
import type { WishlistItem } from '@/types/wishlist-item'
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
      <p className="rounded-2xl border border-dashed border-surface-border py-10 text-center text-sm text-muted">
        위시가 비어 있어요.
      </p>
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
