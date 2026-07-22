'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function encodeError(message: string) {
  return `/forgot-password?error=${encodeURIComponent(message)}`
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  if (!email) redirect(encodeError('이메일을 입력해 주세요'))
  if (!EMAIL_PATTERN.test(email)) redirect(encodeError('올바른 이메일 형식이 아니에요'))

  const requestHeaders = await headers()
  const host = requestHeaders.get('host')
  const proto = requestHeaders.get('x-forwarded-proto') ?? (host?.startsWith('localhost') ? 'http' : 'https')
  const origin = `${proto}://${host}`

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  })
  if (error) redirect(encodeError(error.message))

  redirect('/forgot-password?sent=1')
}
