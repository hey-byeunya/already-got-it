'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { parseOwnedItemFormData } from '@/lib/owned-item-form'

export async function updateOwnedItem(itemId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const values = parseOwnedItemFormData(formData)

  const { data, error } = await supabase
    .from('owned_items')
    .update(values)
    .eq('id', itemId)
    .eq('user_id', user.id)
    .select()

  if (error) throw new Error(error.message)
  if (!data || data.length === 0) throw new Error('보유템을 찾을 수 없어요')

  revalidatePath('/')
  redirect('/')
}

export async function deleteOwnedItem(itemId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('owned_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', user.id)
    .select()

  if (error) throw new Error(error.message)
  if (!data || data.length === 0) throw new Error('보유템을 찾을 수 없어요')

  revalidatePath('/')
  redirect('/')
}
