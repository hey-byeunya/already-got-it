const inputClass =
  'rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:focus:border-white/30'

export default function WishlistItemForm({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>
}) {
  return (
    <form action={action} className="flex flex-col gap-3">
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
        className="mt-2 rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-black"
      >
        위시에 담기
      </button>
    </form>
  )
}
