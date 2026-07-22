'use client'

import { SearchIcon } from '@/components/icons'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <div className="relative flex-1">
      <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? '검색'}
        className="w-full rounded-full border border-surface-border bg-surface py-2 pl-9 pr-3.5 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-accent"
      />
    </div>
  )
}
