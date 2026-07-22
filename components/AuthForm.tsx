'use client'

import { useState, type FormEvent } from 'react'
import { signIn, signUp } from '@/app/login/actions'

type Mode = 'signin' | 'signup'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const inputClass =
  'rounded-xl border border-surface-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent'

export default function AuthForm({ initialError }: { initialError?: string }) {
  const [mode, setMode] = useState<Mode>('signin')
  const [error, setError] = useState<string | null>(initialError ?? null)

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
      const confirmPassword = String(formData.get('confirmPassword') ?? '')
      if (password !== confirmPassword) {
        e.preventDefault()
        setError('비밀번호가 서로 일치하지 않아요')
        return
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
        <input name="email" type="email" required placeholder="이메일" className={inputClass} />
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
