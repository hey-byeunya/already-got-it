'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { parseOwnedItemFormData } from '@/lib/owned-item-form'
import { deriveUsedUpAtForUpdate } from '@/lib/owned-item-status'
import { todayDateString } from '@/lib/inventory'
import type { OwnedItemStatus } from '@/types/owned-item'

export async function updateOwnedItem(itemId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const values = parseOwnedItemFormData(formData)

  // 상태가 실제로 "다 씀"으로 바뀌는 경우에만 오늘 날짜를 새로 기록해야 하므로,
  // 이전 상태/이전 used_up_at을 먼저 조회한다 — 그렇지 않으면 이미 "다 씀"인 항목을
  // 다른 필드만 고쳐 재저장해도 매번 오늘 날짜로 덮어써진다.
  const { data: existing, error: existingError } = await supabase
    .from('owned_items')
    .select('status, used_up_at')
    .eq('id', itemId)
    .eq('user_id', user.id)
    .single<{ status: OwnedItemStatus; used_up_at: string | null }>()

  if (existingError || !existing) throw new Error('보유템을 찾을 수 없어요')

  const used_up_at = deriveUsedUpAtForUpdate(
    existing.status,
    values.status,
    existing.used_up_at,
    todayDateString()
  )

  const { data, error } = await supabase
    .from('owned_items')
    .update({ ...values, used_up_at })
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
