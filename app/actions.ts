'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { OwnedItemStatus } from '@/types/owned-item'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function setOwnedItemStatus(itemId: string, status: OwnedItemStatus) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('owned_items')
    .update({ status })
    .eq('id', itemId)
    .eq('user_id', user.id)
    .select()

  if (error) throw new Error(error.message)
  if (!data || data.length === 0) throw new Error('보유템을 찾을 수 없어요')

  revalidatePath('/')
}
