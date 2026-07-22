'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import SearchBar from '@/components/SearchBar'
import CategoryFilter from '@/components/CategoryFilter'
import OwnedItemList from '@/components/OwnedItemList'
import type { OwnedItem } from '@/types/owned-item'

export default function OwnedItemsExplorer({ items }: { items: OwnedItem[] }) {
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">보유템</h1>
        <Link
          href="/items/new"
          className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-black"
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
      <OwnedItemList items={filtered} />
    </div>
  )
}
