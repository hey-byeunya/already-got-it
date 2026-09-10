'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logServerError } from '@/lib/log-error-server'

export async function updateWishlistItem(itemId: string, formData: FormData) {
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
    await logServerError({ message: '이름을 입력해 주세요', route: 'action:updateWishlistItem' })
    throw new Error('이름을 입력해 주세요')
  }

  const { data, error } = await supabase
    .from('wishlist_items')
    .update({
      name,
      category: categoryRaw || null,
      memo: memoRaw || null,
      link: linkRaw || null,
    })
    .eq('id', itemId)
    .eq('user_id', user.id)
    .select()

  if (error) {
    await logServerError({ message: error.message, route: 'action:updateWishlistItem' })
    throw new Error(error.message)
  }
  if (!data || data.length === 0) {
    await logServerError({ message: '위시 항목을 찾을 수 없어요', route: 'action:updateWishlistItem' })
    throw new Error('위시 항목을 찾을 수 없어요')
  }

  revalidatePath('/wishlist')
  redirect('/wishlist')
}
