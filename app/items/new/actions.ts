'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { parseOwnedItemFormData } from '@/lib/owned-item-form'

export async function createOwnedItem(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const values = parseOwnedItemFormData(formData)

  const { error } = await supabase.from('owned_items').insert({
    ...values,
    user_id: user.id,
  })

  if (error) throw new Error(error.message)

  redirect('/')
}
