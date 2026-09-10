import { createClient } from '@/lib/supabase/server'
import type { ErrorLogInput } from '@/types/error-log'

// Server Action/Pages에서 throw 직전에 호출하는 서버용 로거. 세션이 없으면
// 기록을 생략하고 (정상 세션 만료 경로는 호출부에서 기록하지 않음), 기록 실패는
// 조용히 무시한다 — 원래 에러가 그대로 전파되어야 하므로.
export async function logServerError(input: ErrorLogInput): Promise<void> {
  try {
    const supabase = await createClient()
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
