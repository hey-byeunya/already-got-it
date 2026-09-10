'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logServerError } from '@/lib/log-error-server'

export async function createWishlistItem(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = String(formData.get('name') ?? '').trim()
  const categoryRaw = String(formData.get('category') ?? '').trim()
  const memoRaw = String(formData.get('memo') ?? '').trim()
  const linkRaw = String(formData.get('link') ?? '').trim()

  if (!name) {
    await logServerError({ message: '이름을 입력해 주세요', route: 'action:createWishlistItem' })
    throw new Error('이름을 입력해 주세요')
  }

  const { error } = await supabase.from('wishlist_items').insert({
    user_id: user.id,
    name,
    category: categoryRaw || null,
    memo: memoRaw || null,
    link: linkRaw || null,
  })

  if (error) {
    await logServerError({ message: error.message, route: 'action:createWishlistItem' })
    throw new Error(error.message)
  }

  redirect('/wishlist')
}
