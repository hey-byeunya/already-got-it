'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import SearchBar from '@/components/SearchBar'
import CategoryFilter from '@/components/CategoryFilter'
import OwnedItemList from '@/components/OwnedItemList'
import type { OwnedItem, OwnedItemStatus } from '@/types/owned-item'

interface OwnedItemsExplorerProps {
  items: OwnedItem[]
  onStatusChange?: (itemId: string, status: OwnedItemStatus) => void | Promise<void>
}

export default function OwnedItemsExplorer({ items, onStatusChange }: OwnedItemsExplorerProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('전체')
  const [includeUsedUp, setIncludeUsedUp] = useState(false)

  const categories = useMemo(
    () =>
      Array.from(new Set(items.map((item) => item.category).filter((c): c is string => !!c))).sort(),
    [items]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((item) => {
      const matchesSearch =
        q === '' ||
        item.name.toLowerCase().includes(q) ||
        (item.category ?? '').toLowerCase().includes(q)
      const matchesCategory = category === '전체' || item.category === category
      return matchesSearch && matchesCategory
    })
  }, [items, search, category])

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted">MY SHELF</p>
          <h1 className="text-xl font-semibold tracking-tight">있템</h1>
        </div>
        <Link
          href="/items/new"
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-sm transition-colors hover:bg-accent-hover"
        >
          + 추가
        </Link>
      </div>
      <SearchBar value={search} onChange={setSearch} placeholder="이름·카테고리로 검색" />
      <CategoryFilter categories={categories} value={category} onChange={setCategory} />
      <label className="flex items-center gap-1.5 self-start text-sm text-muted">
        <input
          type="checkbox"
          checked={includeUsedUp}
          onChange={(e) => setIncludeUsedUp(e.target.checked)}
          className="h-4 w-4 rounded border-surface-border accent-accent"
        />
        다 쓴 것도 보기
      </label>
      <OwnedItemList
        items={filtered}
        hasAnyItems={items.length > 0}
        includeUsedUp={includeUsedUp}
        onStatusChange={onStatusChange}
      />
    </div>
  )
}
