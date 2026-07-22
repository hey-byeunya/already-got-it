'use client'

interface CategoryFilterProps {
  categories: string[]
  value: string
  onChange: (value: string) => void
}

export default function CategoryFilter({ categories, value, onChange }: CategoryFilterProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:focus:border-white/30"
    >
      <option value="전체">전체 카테고리</option>
      {categories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  )
}
