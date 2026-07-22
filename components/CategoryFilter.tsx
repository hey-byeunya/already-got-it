'use client'

import { useState } from 'react'
import { CheckIcon, ChevronDownIcon } from '@/components/icons'

interface CategoryFilterProps {
  categories: string[]
  value: string
  onChange: (value: string) => void
}

const COLLAPSED_LIMIT = 5

export default function CategoryFilter({ categories, value, onChange }: CategoryFilterProps) {
  const [expanded, setExpanded] = useState(false)
  const allOptions = ['전체', ...categories]
  const collapsedOptions = allOptions.slice(0, COLLAPSED_LIMIT)
  const hasMore = allOptions.length > COLLAPSED_LIMIT

  if (expanded) {
    return (
      <div className="overflow-hidden rounded-2xl border border-surface-border">
        <div className="flex items-center justify-between border-b border-surface-border bg-surface px-4 py-3">
          <span className="text-sm font-bold">카테고리</span>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="flex items-center gap-1 text-xs font-medium text-muted hover:text-foreground"
          >
            접기
            <ChevronDownIcon className="h-3.5 w-3.5 rotate-180" />
          </button>
        </div>
        <div className="max-h-64 overflow-auto bg-surface">
          {allOptions.map((category, i) => {
            const active = category === value
            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  onChange(category)
                  setExpanded(false)
                }}
                className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${
                  i < allOptions.length - 1 ? 'border-b border-surface-border/60' : ''
                } ${active ? 'bg-accent-soft font-bold text-accent-hover' : 'text-foreground hover:bg-accent-soft/40'}`}
              >
                <span>{category === '전체' ? '전체 카테고리' : category}</span>
                {active && <CheckIcon className="h-4 w-4 text-accent" />}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {collapsedOptions.map((category) => {
        const active = category === value
        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={`whitespace-nowrap rounded-full border-[1.5px] px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active
                ? 'border-accent bg-accent-soft font-bold text-accent-hover'
                : 'border-surface-border text-muted hover:border-accent/40'
            }`}
          >
            {category === '전체' ? '전체 카테고리' : category}
          </button>
        )
      })}
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex items-center gap-1 whitespace-nowrap rounded-full border-[1.5px] border-dashed border-surface-border px-3.5 py-1.5 text-sm font-medium text-muted transition-colors hover:border-accent/40"
        >
          더보기
          <ChevronDownIcon className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
