'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function encodeError(message: string) {
  return `/login?error=${encodeURIComponent(message)}`
}

export async function signIn(formData: FormData) {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  if (!email || !password) redirect(encodeError('이메일과 비밀번호를 입력해 주세요'))

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect(encodeError(error.message))

  redirect('/')
}

export async function signUp(formData: FormData) {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  if (!email || !password) redirect(encodeError('이메일과 비밀번호를 입력해 주세요'))
  if (password.length < 6) redirect(encodeError('비밀번호는 6자 이상이어야 해요'))

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) redirect(encodeError(error.message))

  redirect('/')
}
