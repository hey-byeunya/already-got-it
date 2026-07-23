'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { parseOwnedItemFormData } from '@/lib/owned-item-form'
import { deriveUsedUpAt } from '@/lib/owned-item-status'
import { todayDateString } from '@/lib/inventory'

export async function createOwnedItem(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const values = parseOwnedItemFormData(formData)

  const { error } = await supabase.from('owned_items').insert({
    ...values,
    used_up_at: deriveUsedUpAt(values.status, todayDateString()),
    user_id: user.id,
  })

  if (error) throw new Error(error.message)

  redirect('/')
}
