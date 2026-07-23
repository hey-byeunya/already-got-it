'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import SearchBar from '@/components/SearchBar'
import CategoryFilter from '@/components/CategoryFilter'
import OwnedItemList from '@/components/OwnedItemList'
import { PlusIcon } from '@/components/icons'
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

  const totalCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">있템</h1>
          <p className="mt-1 text-sm text-muted">모두 {totalCount}개 보관 중</p>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2.5 sm:flex-none">
          <div className="min-w-0 flex-1 sm:w-56 sm:flex-none">
            <SearchBar value={search} onChange={setSearch} placeholder="있템 검색" />
          </div>
          <Link
            href="/items/new"
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground shadow-sm transition-colors hover:bg-accent-hover"
          >
            <PlusIcon className="h-4 w-4" />
            추가
          </Link>
        </div>
      </div>
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
