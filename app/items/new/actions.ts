'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logServerError } from '@/lib/log-error-server'
import { parseOwnedItemFormData } from '@/lib/owned-item-form'
import { deriveUsedUpAt } from '@/lib/owned-item-status'
import { todayDateString } from '@/lib/inventory'

export async function createOwnedItem(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let values
  try {
    values = parseOwnedItemFormData(formData)
  } catch (e) {
    const message = e instanceof Error ? e.message : '입력 값이 올바르지 않아요'
    await logServerError({ message, route: 'action:createOwnedItem' })
    throw e
  }

  const { error } = await supabase.from('owned_items').insert({
    ...values,
    used_up_at: deriveUsedUpAt(values.status, todayDateString()),
    user_id: user.id,
  })

  if (error) {
    await logServerError({ message: error.message, route: 'action:createOwnedItem' })
    throw new Error(error.message)
  }

  redirect('/')
}
