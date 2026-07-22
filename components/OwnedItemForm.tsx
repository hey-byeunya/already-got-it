import { OWNED_ITEM_STATUSES, type OwnedItem } from '@/types/owned-item'

const inputClass =
  'rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:focus:border-white/30'

interface OwnedItemFormProps {
  item?: OwnedItem
  action: (formData: FormData) => void | Promise<void>
  submitLabel: string
}

export default function OwnedItemForm({ item, action, submitLabel }: OwnedItemFormProps) {
  const today = new Date().toISOString().slice(0, 10)

  return (
    <form action={action} className="flex flex-col gap-3">
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

      <label className="flex flex-col gap-1 text-sm">
        카테고리
        <input
          name="category"
          type="text"
          required
          defaultValue={item?.category ?? ''}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        수량
        <input
          name="quantity"
          type="number"
          min={1}
          step={1}
          required
          defaultValue={item?.quantity ?? 1}
          className={inputClass}
        />
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

      <label className="flex flex-col gap-1 text-sm">
        상태
        <select name="status" defaultValue={item?.status ?? '미개봉'} className={inputClass}>
          {OWNED_ITEM_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="mt-2 rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-black"
      >
        {submitLabel}
      </button>
    </form>
  )
}
