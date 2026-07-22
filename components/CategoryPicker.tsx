'use client'

import { useState } from 'react'
import { PlusIcon } from '@/components/icons'

interface CategoryPickerProps {
  name?: string
  existingCategories: string[]
  defaultValue?: string | null
}

export default function CategoryPicker({ name = 'category', existingCategories, defaultValue }: CategoryPickerProps) {
  const initial = defaultValue?.trim() || ''
  // 기존 목록에 없는 값(수정 중인 항목의 카테고리 등)도 칩으로 보이게 포함시킨다.
  const baseOptions = initial && !existingCategories.includes(initial) ? [initial, ...existingCategories] : existingCategories

  const [selected, setSelected] = useState(initial)
  const [options, setOptions] = useState(baseOptions)
  const [addingNew, setAddingNew] = useState(false)
  const [newCategory, setNewCategory] = useState('')

  function commitNewCategory() {
    const trimmed = newCategory.trim()
    if (trimmed) {
      if (!options.includes(trimmed)) setOptions((prev) => [...prev, trimmed])
      setSelected(trimmed)
    }
    setNewCategory('')
    setAddingNew(false)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <input type="hidden" name={name} value={selected} />
      {options.map((category) => {
        const active = category === selected
        return (
          <button
            key={category}
            type="button"
            onClick={() => setSelected(category)}
            className={`rounded-xl border-[1.5px] px-4 py-2.5 text-sm font-medium transition-colors ${
              active
                ? 'border-accent bg-accent-soft font-bold text-accent-hover'
                : 'border-surface-border text-muted hover:border-accent/40'
            }`}
          >
            {category}
          </button>
        )
      })}
      {addingNew ? (
        <input
          type="text"
          autoFocus
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onBlur={commitNewCategory}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commitNewCategory()
            }
          }}
          placeholder="카테고리 이름"
          className="rounded-xl border-[1.5px] border-accent px-4 py-2.5 text-sm outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => setAddingNew(true)}
          className="flex items-center gap-1 rounded-xl border-[1.5px] border-dashed border-surface-border px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:border-accent/40"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          새 카테고리
        </button>
      )}
    </div>
  )
}
