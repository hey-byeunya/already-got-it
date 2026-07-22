'use client'

import { useState } from 'react'
import type { OwnedItem, OwnedItemStatus } from '@/types/owned-item'
import PendingOverlay from '@/components/PendingOverlay'
import CategoryPicker from '@/components/CategoryPicker'
import { StatusSegmentedControl } from '@/components/StatusStepper'

const inputClass =
  'rounded-xl border border-surface-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent'

interface OwnedItemFormProps {
  item?: OwnedItem
  existingCategories: string[]
  action: (formData: FormData) => void | Promise<void>
  submitLabel: string
}

export default function OwnedItemForm({ item, existingCategories, action, submitLabel }: OwnedItemFormProps) {
  const today = new Date().toISOString().slice(0, 10)
  const [quantity, setQuantity] = useState(item?.quantity ?? 1)
  const [status, setStatus] = useState<OwnedItemStatus>(item?.status ?? '미개봉')

  function clamp(value: number) {
    if (!Number.isFinite(value) || value < 1) return 1
    return Math.floor(value)
  }

  function handleQuantityChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuantity(clamp(e.target.valueAsNumber))
  }

  return (
    <form action={action} className="relative flex animate-fade-in flex-col gap-3">
      <PendingOverlay />

      <label className="flex flex-col gap-1 text-sm">
        이름
        <input
          name="name"
          type="text"
          required
          defaultValue={item?.name}
          className={inputClass}
        />
      </label>

      <div className="flex flex-col gap-1 text-sm">
        카테고리
        <CategoryPicker existingCategories={existingCategories} defaultValue={item?.category} />
      </div>

      <label className="flex flex-col gap-1 text-sm">
        수량
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuantity((q) => clamp(q - 1))}
            disabled={quantity <= 1}
            aria-label="수량 감소"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-surface-border text-lg font-medium text-foreground transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            −
          </button>
          <input
            name="quantity"
            type="number"
            min={1}
            step={1}
            required
            value={quantity}
            onChange={handleQuantityChange}
            onBlur={() => setQuantity((q) => clamp(q))}
            className={`w-16 text-center ${inputClass}`}
          />
          <button
            type="button"
            onClick={() => setQuantity((q) => clamp(q + 1))}
            aria-label="수량 증가"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-surface-border text-lg font-medium text-foreground transition-colors hover:bg-accent-soft"
          >
            +
          </button>
        </div>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        구매일
        <input
          name="purchased_at"
          type="date"
          required
          defaultValue={item?.purchased_at ?? today}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        사용기한 (선택)
        <input
          name="expiry_date"
          type="date"
          defaultValue={item?.expiry_date ?? ''}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        메모 (선택)
        <textarea
          name="memo"
          rows={2}
          defaultValue={item?.memo ?? ''}
          className={inputClass}
        />
      </label>

      <div className="flex flex-col gap-1 text-sm">
        상태
        <input type="hidden" name="status" value={status} />
        <StatusSegmentedControl status={status} onChange={setStatus} />
      </div>

      <button
        type="submit"
        className="mt-2 rounded-xl bg-accent px-3 py-2.5 text-sm font-medium text-accent-foreground shadow-sm transition-colors hover:bg-accent-hover"
      >
        {submitLabel}
      </button>
    </form>
  )
}
