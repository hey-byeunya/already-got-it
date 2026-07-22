import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OwnedItemsExplorer from '@/components/OwnedItemsExplorer'
import { seedExampleDataIfNeeded } from '@/lib/seed-example-data'
import type { OwnedItem } from '@/types/owned-item'

export default async function OwnedItemsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await seedExampleDataIfNeeded(supabase, user)

  const { data, error } = await supabase.rpc('list_owned_items', { p_search: null })
  if (error) throw new Error(error.message)

  return <OwnedItemsExplorer items={(data ?? []) as OwnedItem[]} />
}
