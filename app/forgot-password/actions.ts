'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { EMAIL_PATTERN, translateAuthError } from '@/lib/auth-errors'

function encodeError(message: string) {
  return `/forgot-password?error=${encodeURIComponent(message)}`
}

// 요청의 Host 헤더를 그대로 신뢰하면, 프록시가 클라이언트가 보낸 Host를 그대로 통과시키는 배포
// 환경에서 비밀번호 재설정 링크의 도착지 자체를 공격자 도메인으로 바꿔치기당할 수 있다(Host Header
// Injection). 프로덕션에서는 반드시 NEXT_PUBLIC_SITE_URL을 신뢰 가능한 값으로 고정해서 쓰고,
// 로컬 개발 편의를 위해서만(값이 없고 프로덕션이 아닐 때) 헤더 기반 계산으로 폴백한다.
function resolveTrustedOrigin(requestHeaders: Headers): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  if (configured) return configured.replace(/\/$/, '')

  if (process.env.NODE_ENV !== 'production') {
    const host = requestHeaders.get('host')
    const proto = requestHeaders.get('x-forwarded-proto') ?? (host?.startsWith('localhost') ? 'http' : 'https')
    return `${proto}://${host}`
  }

  throw new Error('NEXT_PUBLIC_SITE_URL 환경변수가 설정되지 않았어요. 프로덕션 배포 시 반드시 설정해야 합니다.')
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  if (!email) redirect(encodeError('이메일을 입력해 주세요'))
  if (!EMAIL_PATTERN.test(email)) redirect(encodeError('올바른 이메일 형식이 아니에요'))

  const origin = resolveTrustedOrigin(await headers())

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  })
  if (error) redirect(encodeError(translateAuthError(error)))

  redirect('/forgot-password?sent=1')
}
