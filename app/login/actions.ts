'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { EMAIL_PATTERN, translateAuthError } from '@/lib/auth-errors'

function encodeError(message: string) {
  return `/login?error=${encodeURIComponent(message)}`
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
  const nickname = String(formData.get('nickname') ?? '').trim()
  const agreedToTerms = formData.get('agreedToTerms') === 'on'

  if (!email || !password) redirect(encodeError('이메일과 비밀번호를 입력해 주세요'))
  if (!EMAIL_PATTERN.test(email)) redirect(encodeError('올바른 이메일 형식이 아니에요'))
  if (password.length < 6) redirect(encodeError('비밀번호는 6자 이상이어야 해요'))
  if (password !== confirmPassword) redirect(encodeError('비밀번호가 서로 일치하지 않아요'))
  if (nickname.length < 2 || nickname.length > 20) redirect(encodeError('닉네임은 2~20자로 입력해 주세요'))
  if (!agreedToTerms) redirect(encodeError('이용약관 및 개인정보 처리방침에 동의해 주세요'))

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nickname } },
  })
  if (error) redirect(encodeError(translateAuthError(error)))

  // 이메일 인증이 켜져 있으면 signUp 직후에는 세션이 없다(data.session === null). 이 상태로
  // redirect('/')를 하면 세션이 없는 요청이라 proxy.ts가 다시 /login으로 튕겨내는 이중 리다이렉트가
  // 발생하는데, 이 과정에서 화면 전환이 꼬여 로그인 화면에 사이드바가 잘못 나타나는 문제가 있었다.
  // 세션 유무를 여기서 직접 확인해 필요한 목적지로 한 번에 이동시켜 이중 리다이렉트 자체를 없앤다.
  if (!data.session) {
    // 이메일을 URL 쿼리스트링에 실으면 브라우저 히스토리/서버 접근 로그에 그대로 남으므로,
    // 60초 뒤 자연 만료되는 쿠키에 담아 로그인 화면(Server Component)에서 서버 사이드로만 읽는다.
    const cookieStore = await cookies()
    cookieStore.set('signup_email', email, { maxAge: 60 })
    redirect('/login?signedUp=1')
  }

  redirect('/')
}
