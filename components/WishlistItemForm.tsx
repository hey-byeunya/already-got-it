import PendingOverlay from '@/components/PendingOverlay'

const inputClass =
  'rounded-xl border border-surface-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent'

export default function WishlistItemForm({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>
}) {
  return (
    <form action={action} className="relative flex animate-fade-in flex-col gap-3">
      <PendingOverlay />

      <label className="flex flex-col gap-1 text-sm">
        이름
        <input name="name" type="text" required className={inputClass} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        카테고리 (선택)
        <input name="category" type="text" className={inputClass} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        메모 (선택)
        <textarea name="memo" rows={2} className={inputClass} />
      </label>

      <button
        type="submit"
        className="mt-2 rounded-xl bg-accent px-3 py-2.5 text-sm font-medium text-accent-foreground shadow-sm transition-colors hover:bg-accent-hover"
      >
        위시에 담기
      </button>
    </form>
  )
}
