import Image from 'next/image'
import AuthForm from '@/components/AuthForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-4 py-12">
      <div>
        <span className="flex items-center gap-1.5 font-extrabold tracking-tight text-accent">
          <Image src="/logo.png" alt="" width={22} height={22} className="rounded-sm" />
          이미 있어
        </span>
        <p className="mt-4 text-lg font-semibold tracking-tight text-accent">
          물욕은 인정, 관리는 앱으로
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          이미 가진 걸 까먹고 또 사는 걸 막아주는,
          <br />
          아주 사적인 재고 관리 도구
        </p>
      </div>

      <AuthForm initialError={error} />
    </div>
  )
}
