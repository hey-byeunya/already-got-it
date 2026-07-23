import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OwnedItemForm from '@/components/OwnedItemForm'
import PendingOverlay from '@/components/PendingOverlay'
import { BackIcon, TrashIcon } from '@/components/icons'
import type { OwnedItem } from '@/types/owned-item'
import { updateOwnedItem, deleteOwnedItem } from './actions'

export default async function EditOwnedItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: item, error }, { data: categories, error: categoriesError }] = await Promise.all([
    supabase.from('owned_items').select('*').eq('id', id).eq('user_id', user.id).single<OwnedItem>(),
    supabase.rpc('list_owned_categories'),
  ])

  if (error || !item) notFound()
  if (categoriesError) throw new Error(categoriesError.message)

  const boundUpdate = updateOwnedItem.bind(null, id)
  const boundDelete = deleteOwnedItem.bind(null, id)

  return (
    <div className="mx-auto flex w-full max-w-4xl animate-fade-in flex-col gap-4">
      <div className="overflow-hidden rounded-[28px] border border-surface-border bg-surface">
        <div className="flex items-center gap-3 border-b border-surface-border px-6 py-5">
          <Link
            href="/"
            aria-label="있템 목록으로"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-foreground transition-colors hover:text-accent"
          >
            <BackIcon className="h-4 w-4" />
          </Link>
          <h1 className="text-lg font-semibold">있템 수정</h1>
        </div>
        <div className="p-6">
          <OwnedItemForm
            item={item}
            existingCategories={(categories ?? []) as string[]}
            action={boundUpdate}
            submitLabel="변경사항 저장"
            secondaryAction={
              <form action={boundDelete} className="relative shrink-0">
                <PendingOverlay label="삭제하는 중..." />
                <button
                  type="submit"
                  className="flex h-full items-center gap-1.5 whitespace-nowrap rounded-xl border border-dday-overdue/40 px-4 py-2.5 text-sm font-medium text-dday-overdue transition-colors hover:bg-dday-overdue-bg"
                >
                  <TrashIcon className="h-4 w-4" />
                  삭제하기
                </button>
              </form>
            }
          />
        </div>
      </div>
    </div>
  )
}
