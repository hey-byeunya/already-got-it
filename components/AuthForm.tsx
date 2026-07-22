'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { signIn, signUp } from '@/app/login/actions'
import { REMEMBERED_EMAIL_KEY } from '@/lib/client-session'

type Mode = 'signin' | 'signup'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const inputClass =
  'rounded-xl border border-surface-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent'

export default function AuthForm({ initialError }: { initialError?: string }) {
  const [mode, setMode] = useState<Mode>('signin')
  const [error, setError] = useState<string | null>(initialError ?? null)
  const [rememberEmail, setRememberEmail] = useState(false)
  const [rememberedEmail, setRememberedEmail] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  useEffect(() => {
    // localStorage는 서버 렌더링 시점에 없으므로, 하이드레이션 불일치를 피하려면
    // 마운트 후 이 effect에서만 읽어와 반영해야 한다 (렌더 중 파생 불가).
    const saved = window.localStorage.getItem(REMEMBERED_EMAIL_KEY)
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRememberedEmail(saved)
      setRememberEmail(true)
    }
  }, [])

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.currentTarget)
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')

    if (!email || !password) {
      e.preventDefault()
      setError('이메일과 비밀번호를 입력해 주세요')
      return
    }
    if (!EMAIL_PATTERN.test(email)) {
      e.preventDefault()
      setError('올바른 이메일 형식이 아니에요')
      return
    }
    if (password.length < 6) {
      e.preventDefault()
      setError('비밀번호는 6자 이상이어야 해요')
      return
    }
    if (mode === 'signup') {
      const nickname = String(formData.get('nickname') ?? '').trim()
      const confirmPassword = String(formData.get('confirmPassword') ?? '')
      if (nickname.length < 2 || nickname.length > 20) {
        e.preventDefault()
        setError('닉네임은 2~20자로 입력해 주세요')
        return
      }
      if (password !== confirmPassword) {
        e.preventDefault()
        setError('비밀번호가 서로 일치하지 않아요')
        return
      }
      if (!agreedToTerms) {
        e.preventDefault()
        setError('이용약관 및 개인정보 처리방침에 동의해 주세요')
        return
      }
    }

    if (mode === 'signin') {
      if (rememberEmail) {
        window.localStorage.setItem(REMEMBERED_EMAIL_KEY, email)
      } else {
        window.localStorage.removeItem(REMEMBERED_EMAIL_KEY)
      }
    }

    setError(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 rounded-full border border-surface-border bg-surface p-1">
        <button
          type="button"
          onClick={() => switchMode('signin')}
          className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === 'signin' ? 'bg-accent text-accent-foreground' : 'text-muted hover:text-foreground'
          }`}
        >
          로그인
        </button>
        <button
          type="button"
          onClick={() => switchMode('signup')}
          className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === 'signup' ? 'bg-accent text-accent-foreground' : 'text-muted hover:text-foreground'
          }`}
        >
          회원가입
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-dday-overdue-bg px-3 py-2 text-sm text-dday-overdue">
          {error}
        </p>
      )}

      <form
        key={mode}
        noValidate
        action={mode === 'signin' ? signIn : signUp}
        onSubmit={handleSubmit}
        onChange={() => setError(null)}
        className="flex flex-col gap-3"
      >
        {mode === 'signup' && (
          <input name="nickname" type="text" required placeholder="닉네임" className={inputClass} />
        )}
        <input
          name="email"
          type="email"
          required
          placeholder="이메일"
          defaultValue={mode === 'signin' ? rememberedEmail : undefined}
          className={inputClass}
        />
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="비밀번호 (6자 이상)"
          className={inputClass}
        />
        {mode === 'signup' && (
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={6}
            placeholder="비밀번호 확인"
            className={inputClass}
          />
        )}
        {mode === 'signin' && (
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={rememberEmail}
                onChange={(e) => setRememberEmail(e.target.checked)}
                className="h-4 w-4 rounded border-surface-border accent-accent"
              />
              이메일 저장
            </label>
            <Link href="/forgot-password" className="text-sm text-muted hover:text-accent">
              비밀번호를 잊으셨나요?
            </Link>
          </div>
        )}
        {mode === 'signup' && (
          <label className="flex items-start gap-2 text-sm text-muted">
            <input
              type="checkbox"
              name="agreedToTerms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-surface-border accent-accent"
            />
            <span>
              <span className="font-medium text-foreground">이용약관</span> 및{' '}
              <span className="font-medium text-foreground">개인정보 처리방침</span>에 동의합니다
            </span>
          </label>
        )}
        <button
          type="submit"
          className="mt-1 rounded-xl bg-accent px-3 py-2.5 text-sm font-medium text-accent-foreground shadow-sm transition-colors hover:bg-accent-hover"
        >
          확인
        </button>
      </form>
    </div>
  )
}
