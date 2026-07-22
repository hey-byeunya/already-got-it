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
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="이름·카테고리로 검색" />
        </div>
        <CategoryFilter categories={categories} value={category} onChange={setCategory} />
      </div>
      <OwnedItemList items={filtered} onStatusChange={onStatusChange} />
    </div>
  )
}
