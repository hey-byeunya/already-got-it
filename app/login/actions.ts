'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function encodeError(message: string) {
  return `/login?error=${encodeURIComponent(message)}`
}

function translateAuthError(error: { message: string; code?: string }): string {
  const code = error.code
  const msg = error.message

  if (code === 'invalid_credentials' || msg.includes('Invalid login credentials')) {
    return '이메일 또는 비밀번호가 올바르지 않아요. 등록되지 않은 이메일일 수도 있어요.'
  }
  if (code === 'email_not_confirmed' || msg.includes('Email not confirmed')) {
    return '이메일 인증이 아직 완료되지 않았어요. 받은 편지함에서 인증 메일을 확인해 주세요.'
  }
  if (code === 'user_already_exists' || msg.includes('already registered')) {
    return '이미 가입된 이메일이에요. 로그인해 주세요.'
  }
  if (code === 'weak_password' || msg.includes('Password')) {
    return '비밀번호가 너무 약해요. 6자 이상의 다른 비밀번호를 입력해 주세요.'
  }
  if (code === 'over_email_send_rate_limit' || msg.includes('email rate limit')) {
    return '인증 메일 발송 횟수 제한에 걸렸어요. 잠시 후(보통 1시간 이내) 다시 시도해 주세요.'
  }
  return msg
}

export async function signIn(formData: FormData) {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  if (!email || !password) redirect(encodeError('이메일과 비밀번호를 입력해 주세요'))

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect(encodeError(translateAuthError(error)))

  redirect('/')
}

export async function signUp(formData: FormData) {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')
  if (!email || !password) redirect(encodeError('이메일과 비밀번호를 입력해 주세요'))
  if (!EMAIL_PATTERN.test(email)) redirect(encodeError('올바른 이메일 형식이 아니에요'))
  if (password.length < 6) redirect(encodeError('비밀번호는 6자 이상이어야 해요'))
  if (password !== confirmPassword) redirect(encodeError('비밀번호가 서로 일치하지 않아요'))

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) redirect(encodeError(translateAuthError(error)))

  redirect('/')
}
