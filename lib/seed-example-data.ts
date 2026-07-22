import type { SupabaseClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export async function seedExampleDataIfNeeded(supabase: SupabaseClient, user: User) {
  if (user.user_metadata?.seeded_examples) return

  const [{ count: ownedCount }, { count: wishlistCount }] = await Promise.all([
    supabase.from('owned_items').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('wishlist_items').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const tasks: PromiseLike<{ error: { message: string } | null }>[] = []

  if (!ownedCount) {
    const today = new Date()
    const expiry = new Date(today)
    expiry.setDate(expiry.getDate() + 90)

    tasks.push(
      supabase.from('owned_items').insert({
        user_id: user.id,
        name: '수분크림 (예시)',
        category: '스킨케어',
        quantity: 1,
        purchased_at: toDateString(today),
        expiry_date: toDateString(expiry),
        memo: '이렇게 등록해두면 사용기한이 임박했을 때 D-day로 알려드려요. 자유롭게 수정하거나 삭제해 보세요.',
        status: '미개봉',
      })
    )
  }

  if (!wishlistCount) {
    tasks.push(
      supabase.from('wishlist_items').insert({
        user_id: user.id,
        name: '립밤 (예시)',
        category: '스킨케어',
        memo: "사고 싶은 걸 여기에 담아두고, 실제로 사면 '구매완료'를 눌러 보유템으로 옮겨 보세요.",
      })
    )
  }

  const results = tasks.length > 0 ? await Promise.all(tasks) : []
  if (results.some((r) => r.error)) return

  await supabase.auth.updateUser({ data: { seeded_examples: true } })
}
