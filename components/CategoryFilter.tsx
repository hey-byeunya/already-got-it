'use client'

import { ChevronDownIcon } from '@/components/icons'

interface CategoryFilterProps {
  categories: string[]
  value: string
  onChange: (value: string) => void
}

export default function CategoryFilter({ categories, value, onChange }: CategoryFilterProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-full border border-surface-border bg-surface py-2 pl-3.5 pr-9 text-sm text-foreground outline-none transition-colors focus:border-accent"
      >
        <option value="전체">전체 카테고리</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
    </div>
  )
}
