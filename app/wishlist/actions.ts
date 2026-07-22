'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

function encodeError(message: string) {
  return `/wishlist?error=${encodeURIComponent(message)}`
}

export async function deleteWishlistItem(itemId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(encodeError('로그인이 필요해요'))

  const { data, error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', user.id)
    .select()

  if (error) redirect(encodeError(error.message))
  if (!data || data.length === 0) {
    // 이미 삭제됐거나 구매 처리된 항목에 대한 중복 요청(예: 더블 클릭) — 조용히 최신 목록만 다시 보여준다.
    revalidatePath('/wishlist')
    return
  }

  revalidatePath('/wishlist')
}

export async function markWishlistPurchased(itemId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(encodeError('로그인이 필요해요'))

  const { error } = await supabase.rpc('mark_wishlist_purchased', {
    p_wishlist_item_id: itemId,
  })

  if (error) {
    if (error.code === 'P0002') {
      // 이미 삭제됐거나 구매 처리된 항목에 대한 중복 요청(예: 더블 클릭) — 조용히 최신 목록만 다시 보여준다.
      revalidatePath('/wishlist')
      return
    }
    redirect(encodeError(`구매 처리 중 오류가 발생했어요: ${error.message}`))
  }

  revalidatePath('/wishlist')
  revalidatePath('/')
}
