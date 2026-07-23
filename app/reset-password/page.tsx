'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const inputClass =
  'rounded-xl border border-surface-border bg-input-bg px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const password = String(formData.get('password') ?? '')
    const confirmPassword = String(formData.get('confirmPassword') ?? '')

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 해요')
      return
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 서로 일치하지 않아요')
      return
    }

    setPending(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setPending(false)

    if (updateError) {
      setError('링크가 만료되었거나 오류가 발생했어요. 다시 시도해 주세요.')
      return
    }

    setError(null)
    setDone(true)
    setTimeout(() => router.push('/'), 1500)
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-12">
      <div>
        <p className="text-lg font-semibold tracking-tight">새 비밀번호 설정</p>
        <p className="mt-2 text-sm text-muted">이메일로 받은 링크를 통해 들어오셨다면 새 비밀번호를 설정할 수 있어요.</p>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-dday-overdue-bg px-3 py-2 text-sm text-dday-overdue">
          {error}
        </p>
      )}
      {done && (
        <p role="status" className="rounded-xl bg-accent-soft px-3 py-2 text-sm text-accent">
          비밀번호가 변경됐어요. 잠시 후 이동합니다.
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="새 비밀번호 (6자 이상)"
          className={inputClass}
        />
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={6}
          placeholder="새 비밀번호 확인"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-accent px-3 py-2.5 text-sm font-medium text-accent-foreground shadow-sm transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          비밀번호 변경
        </button>
      </form>
    </div>
  )
}
