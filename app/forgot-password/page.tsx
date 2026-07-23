import Link from 'next/link'
import Image from 'next/image'
import { requestPasswordReset } from './actions'

const inputClass =
  'rounded-xl border border-surface-border bg-input-bg px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>
}) {
  const { error, sent } = await searchParams

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-12">
      <div>
        <span className="flex items-center gap-1.5 font-extrabold tracking-tight text-accent">
          <Image src="/logo.png" alt="" width={22} height={22} className="rounded-sm" />
          이미 있어
        </span>
        <p className="mt-4 text-lg font-semibold tracking-tight">비밀번호를 잊으셨나요?</p>
        <p className="mt-2 text-sm text-muted">가입하신 이메일로 재설정 링크를 보내드릴게요.</p>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-dday-overdue-bg px-3 py-2 text-sm text-dday-overdue">
          {error}
        </p>
      )}
      {sent && (
        <p role="status" className="rounded-xl bg-accent-soft px-3 py-2 text-sm text-accent">
          재설정 링크를 보냈어요. 메일함을 확인해 주세요.
        </p>
      )}

      <form action={requestPasswordReset} className="flex flex-col gap-3">
        <input name="email" type="email" required placeholder="이메일" className={inputClass} />
        <button
          type="submit"
          className="rounded-xl bg-accent px-3 py-2.5 text-sm font-medium text-accent-foreground shadow-sm transition-colors hover:bg-accent-hover"
        >
          재설정 링크 보내기
        </button>
      </form>

      <Link href="/login" className="text-center text-sm text-muted hover:text-accent">
        로그인으로 돌아가기
      </Link>
    </div>
  )
}
