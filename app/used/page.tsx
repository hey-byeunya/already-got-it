import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UsedItemList from '@/components/UsedItemList'
import { isUsedUpItem, sortByUsedUpAtDesc } from '@/lib/owned-item-status'
import { revertUsedItem } from '@/app/actions'
import type { OwnedItem } from '@/types/owned-item'

export default async function UsedItemsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase.rpc('list_owned_items', { p_search: null })
  if (error) throw new Error(error.message)

  const usedItems = sortByUsedUpAtDesc(((data ?? []) as OwnedItem[]).filter(isUsedUpItem))

  return (
    <div className="mx-auto flex w-full max-w-6xl animate-fade-in flex-col gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">쓴템</h1>
        <p className="mt-1 text-sm text-muted">다 쓴 있템을 모아뒀어요</p>
      </div>
      <UsedItemList items={usedItems} revertItem={revertUsedItem} />
    </div>
  )
}
