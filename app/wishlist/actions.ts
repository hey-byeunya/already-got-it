'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function deleteWishlistItem(itemId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', user.id)
    .select()

  if (error) throw new Error(error.message)
  if (!data || data.length === 0) throw new Error('위시리스트 항목을 찾을 수 없어요')

  revalidatePath('/wishlist')
}

export async function markWishlistPurchased(itemId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.rpc('mark_wishlist_purchased', {
    p_wishlist_item_id: itemId,
  })

  if (error) throw new Error('이미 처리되었거나 존재하지 않는 항목이에요')

  revalidatePath('/wishlist')
  revalidatePath('/')
}
