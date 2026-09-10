'use client'

import { createClient } from '@/lib/supabase/client'
import type { ErrorLogInput } from '@/types/error-log'

// app/error.tsx에서 호출하는 클라이언트용 로거. 비로그인 상태면 기록을 생략하고,
// 기록 실패는 조용히 무시한다 (로깅 실패가 에러 화면을 깨면 안 됨).
export async function logClientError(input: ErrorLogInput): Promise<void> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('error_logs').insert({
      user_id: user.id,
      message: input.message,
      route: input.route,
      digest: input.digest ?? null,
    })
  } catch {
    // 로깅 실패 무시 (fail-open)
  }
}
