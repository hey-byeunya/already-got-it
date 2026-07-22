'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createWishlistItem(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const name = String(formData.get('name') ?? '').trim()
  const categoryRaw = String(formData.get('category') ?? '').trim()
  const memoRaw = String(formData.get('memo') ?? '').trim()

  if (!name) throw new Error('이름을 입력해 주세요')

  const { error } = await supabase.from('wishlist_items').insert({
    user_id: user.id,
    name,
    category: categoryRaw || null,
    memo: memoRaw || null,
  })

  if (error) throw new Error(error.message)

  redirect('/wishlist')
}
