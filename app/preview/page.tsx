'use client'

import { useState } from 'react'
import Link from 'next/link'
import OwnedItemsExplorer from '@/components/OwnedItemsExplorer'
import type { OwnedItem, OwnedItemStatus } from '@/types/owned-item'

const EXAMPLE_OWNED_ITEMS: OwnedItem[] = [
  {
    id: 'preview-1',
    user_id: 'preview-user',
    name: '레티놀 세럼',
    category: '스킨케어',
    quantity: 1,
    purchased_at: '2026-05-01',
    expiry_date: '2026-08-01',
    memo: null,
    status: '사용중',
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
  },
  {
    id: 'preview-2',
    user_id: 'preview-user',
    name: '수분크림',
    category: '스킨케어',
    quantity: 1,
    purchased_at: '2026-03-10',
    expiry_date: '2026-07-15',
    memo: null,
    status: '미개봉',
    created_at: '2026-03-10T00:00:00Z',
    updated_at: '2026-03-10T00:00:00Z',
  },
  {
    id: 'preview-3',
    user_id: 'preview-user',
    name: '텀블러',
    category: '잡화',
    quantity: 1,
    purchased_at: '2026-06-10',
    expiry_date: null,
    memo: null,
    status: '사용중',
    created_at: '2026-06-10T00:00:00Z',
    updated_at: '2026-06-10T00:00:00Z',
  },
]

export default function OwnedItemsPreviewPage() {
  const [items, setItems] = useState(EXAMPLE_OWNED_ITEMS)

  const handleStatusChange = (itemId: string, status: OwnedItemStatus) => {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, status } : item)))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-dashed border-accent/40 bg-accent-soft px-3.5 py-2.5 text-sm text-accent">
        예시 데이터 미리보기예요. 여기서 바꾼 내용은 저장되지 않아요.{' '}
        <Link href="/preview/wishlist" className="underline underline-offset-2">
          위시 미리보기 →
        </Link>
      </div>
      <OwnedItemsExplorer items={items} onStatusChange={handleStatusChange} />
    </div>
  )
}
