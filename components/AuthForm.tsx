'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { signIn, signUp } from '@/app/login/actions'
import { REMEMBERED_EMAIL_KEY } from '@/lib/client-session'
import { CheckIcon } from '@/components/icons'

type Mode = 'signin' | 'signup'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const inputClass =
  'rounded-xl border border-surface-border bg-input-bg px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent'

const TITLE_COPY: Record<Mode, { title: string; sub: string }> = {
  signin: { title: '다시 오셨네요', sub: '계정에 로그인하고 재고를 이어서 관리해요.' },
  signup: { title: '계정 만들기', sub: '나만의 재고 공간을 만들어요.' },
}

interface AuthFormProps {
  mode: Mode
  onModeChange: (mode: Mode) => void
  initialError?: string
  initialInfo?: string
  initialEmail?: string
}

export default function AuthForm({ mode, onModeChange, initialError, initialInfo, initialEmail }: AuthFormProps) {
  const [error, setError] = useState<string | null>(initialError ?? null)
  const [info, setInfo] = useState<string | null>(initialInfo ?? null)
  const [rememberEmail, setRememberEmail] = useState(false)
  const [rememberedEmail, setRememberedEmail] = useState(initialEmail ?? '')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  useEffect(() => {
    // 방금 회원가입한 이메일이 있으면 그걸 우선 보여주고, 로컬에 저장된 이메일로 덮어쓰지 않는다.
    if (initialEmail) return
    // localStorage는 서버 렌더링 시점에 없으므로, 하이드레이션 불일치를 피하려면
    // 마운트 후 이 effect에서만 읽어와 반영해야 한다 (렌더 중 파생 불가).
    const saved = window.localStorage.getItem(REMEMBERED_EMAIL_KEY)
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRememberedEmail(saved)
      setRememberEmail(true)
    }
  }, [initialEmail])

  function switchMode(next: Mode) {
    onModeChange(next)
    setError(null)
    setInfo(null)
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

  const { title, sub } = TITLE_COPY[mode]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight md:text-[28px]">{title}</h1>
        <p className="mt-2 text-sm text-muted">{sub}</p>
      </div>

      {info && (
        <p role="status" className="rounded-xl bg-accent-soft px-3 py-2 text-sm text-accent">
          {info}
        </p>
      )}
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
        onChange={() => {
          setError(null)
          setInfo(null)
        }}
        className="flex flex-col gap-3"
      >
        {mode === 'signup' && (
          <input name="nickname" type="text" required placeholder="앱에서 불릴 이름" className={inputClass} />
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
            <label className="flex items-center gap-2.5 text-sm font-medium text-muted">
              <input
                type="checkbox"
                checked={rememberEmail}
                onChange={(e) => setRememberEmail(e.target.checked)}
                className="peer sr-only"
              />
              <span
                className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] border-[1.5px] transition-colors ${
                  rememberEmail ? 'border-accent bg-accent' : 'border-surface-border bg-surface'
                }`}
              >
                {rememberEmail && <CheckIcon className="h-3.5 w-3.5 text-accent-foreground" />}
              </span>
              이메일 저장
            </label>
            <Link href="/forgot-password" className="text-sm text-muted hover:text-accent">
              비밀번호를 잊으셨나요?
            </Link>
          </div>
        )}
        {mode === 'signup' && (
          <label className="flex items-start gap-2.5 text-sm text-muted">
            <input
              type="checkbox"
              name="agreedToTerms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="peer sr-only"
            />
            <span
              className={`mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] border-[1.5px] transition-colors ${
                agreedToTerms ? 'border-accent bg-accent' : 'border-surface-border bg-surface'
              }`}
            >
              {agreedToTerms && <CheckIcon className="h-3.5 w-3.5 text-accent-foreground" />}
            </span>
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
          {mode === 'signin' ? '로그인' : '가입하고 시작하기'}
        </button>
      </form>

      <div className="text-center text-sm text-muted">
        {mode === 'signin' ? (
          <>
            아직 계정이 없나요?{' '}
            <button type="button" onClick={() => switchMode('signup')} className="font-bold text-foreground hover:text-accent">
              회원가입
            </button>
          </>
        ) : (
          <>
            이미 계정이 있나요?{' '}
            <button type="button" onClick={() => switchMode('signin')} className="font-bold text-foreground hover:text-accent">
              로그인
            </button>
          </>
        )}
      </div>
    </div>
  )
}
