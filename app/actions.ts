'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { OwnedItemStatus } from '@/types/owned-item'
import { deriveUsedUpAt, revertUsedItemFields } from '@/lib/owned-item-status'
import { todayDateString } from '@/lib/inventory'

// 여기서는 서버 쪽 세션(쿠키)만 정리한다. 로그인 화면으로의 이동은 호출부(ProfileMenu)가
// 클라이언트에서 전체 페이지 새로고침으로 처리한다 — 그래야 다음 로그인 사용자가 이전
// 사용자의 화면 상태(React state)나 Next.js 라우터 캐시를 이어받지 않는다. 여기서
// redirect()로 이동시키면 클라이언트 사이드 전환이 되어 그 보장이 깨진다.
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

// 첫 진입 온보딩 투어를 봤다는 표시. localStorage 대신 user_metadata에 저장하는 이유는
// lib/client-session.ts의 clearClientSessionState()가 로그아웃 시 이메일 저장값 하나만
// 남기고 localStorage를 전부 지우기 때문 — 여기 저장하면 로그아웃 후 재로그인할 때마다
// 투어가 다시 뜨는 버그가 생긴다. user_metadata는 계정에 귀속되므로 그 문제가 없다.
export async function markOnboardingSeen() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.auth.updateUser({ data: { has_seen_onboarding: true } })
}

// "모든 힌트 초기화"용 — 온보딩 투어를 다시 자동으로 뜨게 되돌린다. 배지 힌트 자체의
// seenTooltips는 localStorage에 있어 클라이언트에서 따로 지운다(lib/tooltip-hints.ts).
export async function resetOnboardingSeen() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.auth.updateUser({ data: { has_seen_onboarding: false } })
}

export async function setOwnedItemStatus(itemId: string, status: OwnedItemStatus) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  // 세션이 끊긴 채로(만료 등) 액션이 호출된 경우 에러를 던지는 대신 바로 로그인 화면으로
  // 보낸다 — 그래야 화면에 남아있던 이전 데이터가 에러 화면 뒤에 계속 떠 있지 않는다.
  if (!user) redirect('/login')

  // 상태 전이: "다 씀"으로 바뀌면 usedUpAt을 오늘 날짜로 기록하고, 그 외 상태로 바뀌면
  // (다시 사용중/미개봉으로 되돌아가는 경우 포함) usedUpAt을 null로 초기화한다.
  const used_up_at = deriveUsedUpAt(status, todayDateString())

  const { data, error } = await supabase
    .from('owned_items')
    .update({ status, used_up_at })
    .eq('id', itemId)
    .eq('user_id', user.id)
    .select()

  if (error) throw new Error(error.message)
  if (!data || data.length === 0) throw new Error('보유템을 찾을 수 없어요')

  revalidatePath('/')
  revalidatePath('/used')
}

// 쓴템 목록의 "되돌리기" 버튼 전용 액션. 스테퍼와 달리 목표 상태가 항상 "사용중"
// 하나로 고정되어 있으므로 상태 값을 인자로 받지 않는다.
export async function revertUsedItem(itemId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 상태 전이("다 씀" → "사용중")와 usedUpAt 초기화를 한 번에 반영해, 두 필드가
  // 서로 어긋난 상태(예: 사용중인데 usedUpAt이 남아있는 상태)가 생기지 않게 한다.
  const { data, error } = await supabase
    .from('owned_items')
    .update(revertUsedItemFields())
    .eq('id', itemId)
    .eq('user_id', user.id)
    .select()

  if (error) throw new Error(error.message)
  if (!data || data.length === 0) throw new Error('보유템을 찾을 수 없어요')

  // 쓴템 목록에서는 즉시 사라지고, 있템 목록에는 "사용중" 상태로 나타나야 하므로 둘 다 갱신한다.
  revalidatePath('/')
  revalidatePath('/used')
}
