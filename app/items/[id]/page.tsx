import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OwnedItemForm from '@/components/OwnedItemForm'
import PendingOverlay from '@/components/PendingOverlay'
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

  const { data: item, error } = await supabase
    .from('owned_items')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single<OwnedItem>()

  if (error || !item) notFound()

  const boundUpdate = updateOwnedItem.bind(null, id)
  const boundDelete = deleteOwnedItem.bind(null, id)

  return (
    <div className="flex animate-fade-in flex-col gap-4">
      <h1 className="text-lg font-semibold">있템 수정</h1>
      <OwnedItemForm item={item} action={boundUpdate} submitLabel="저장" />
      <form action={boundDelete} className="relative">
        <PendingOverlay label="삭제하는 중..." />
        <button
          type="submit"
          className="w-full rounded-xl border border-dday-overdue/40 px-3 py-2 text-sm font-medium text-dday-overdue transition-colors hover:bg-dday-overdue-bg"
        >
          삭제
        </button>
      </form>
    </div>
  )
}
