import { useId, type ReactNode } from 'react'
import PendingOverlay from '@/components/PendingOverlay'
import CategoryPicker from '@/components/CategoryPicker'
import { LinkIcon } from '@/components/icons'
import type { WishlistItem } from '@/types/wishlist-item'

const inputClass =
  'rounded-xl border border-surface-border bg-input-bg px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent'

interface WishlistItemFormProps {
  item?: WishlistItem
  existingCategories: string[]
  action: (formData: FormData) => void | Promise<void>
  submitLabel: string
  // 삭제 버튼처럼 별도 <form>이 필요한 보조 액션을 저장 버튼과 같은 줄에 나란히 붙이기 위한 슬롯.
  // 이 폼의 <form> 밖(형제 요소)에 렌더링되므로 <form> 중첩(유효하지 않은 HTML) 없이 동작한다.
  secondaryAction?: ReactNode
}

export default function WishlistItemForm({
  item,
  existingCategories,
  action,
  submitLabel,
  secondaryAction,
}: WishlistItemFormProps) {
  const formId = useId()

  return (
    <div className="flex animate-fade-in flex-col gap-3">
      <form id={formId} action={action} className="relative flex flex-col gap-3">
        <PendingOverlay />

        <label className="flex flex-col gap-1 text-sm">
          이름
          <input name="name" type="text" required defaultValue={item?.name} className={inputClass} />
        </label>

        <div className="flex flex-col gap-1 text-sm">
          카테고리 (선택)
          <CategoryPicker existingCategories={existingCategories} defaultValue={item?.category} />
        </div>

        <label className="flex flex-col gap-1 text-sm">
          왜 갖고 싶어요? (선택)
          <textarea name="memo" rows={3} defaultValue={item?.memo ?? ''} className={inputClass} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          참고 링크 (선택)
          <div className="relative">
            <LinkIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              name="link"
              type="text"
              placeholder="상품 링크 붙여넣기"
              defaultValue={item?.link ?? ''}
              className={`${inputClass} w-full pl-9`}
            />
          </div>
        </label>
      </form>

      <div className="mt-2 flex gap-3">
        <button
          type="submit"
          form={formId}
          className="flex-1 rounded-xl bg-accent px-3 py-2.5 text-sm font-medium text-accent-foreground shadow-sm transition-colors hover:bg-accent-hover"
        >
          {submitLabel}
        </button>
        {secondaryAction}
      </div>
    </div>
  )
}
