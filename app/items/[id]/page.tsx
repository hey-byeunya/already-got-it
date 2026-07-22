import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OwnedItemForm from '@/components/OwnedItemForm'
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
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">보유템 수정</h1>
      <OwnedItemForm item={item} action={boundUpdate} submitLabel="저장" />
      <form action={boundDelete}>
        <button
          type="submit"
          className="w-full rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          삭제
        </button>
      </form>
    </div>
  )
}
