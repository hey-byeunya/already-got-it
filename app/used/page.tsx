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
    <div className="flex animate-fade-in flex-col gap-4">
      <div>
        <p className="text-xs font-medium tracking-wide text-muted">USED UP</p>
        <h1 className="text-xl font-semibold tracking-tight">쓴템</h1>
      </div>
      <UsedItemList items={usedItems} revertItem={revertUsedItem} />
    </div>
  )
}
