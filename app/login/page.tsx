import { signIn, signUp } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-12">
      <div>
        <h1 className="text-xl font-semibold">이미 있어</h1>
        <p className="mt-1 text-sm text-black/50 dark:text-white/50">
          로그인하고 내 보유템과 위시리스트를 관리하세요.
        </p>
      </div>

      {error && (
        <p className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
          {error}
        </p>
      )}

      <form className="flex flex-col gap-3">
        <input
          name="email"
          type="email"
          required
          placeholder="이메일"
          className="rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:focus:border-white/30"
        />
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="비밀번호 (6자 이상)"
          className="rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:focus:border-white/30"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            formAction={signIn}
            className="flex-1 rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-black"
          >
            로그인
          </button>
          <button
            type="submit"
            formAction={signUp}
            className="flex-1 rounded-md border border-black/10 px-3 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
          >
            회원가입
          </button>
        </div>
      </form>
    </div>
  )
}
