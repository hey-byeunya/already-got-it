import { cookies } from 'next/headers'
import AuthScreen from '@/components/AuthScreen'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; signedUp?: string }>
}) {
  const { error, signedUp } = await searchParams
  const info = signedUp ? '가입 확인 메일을 보냈어요. 메일함에서 인증을 완료한 뒤 로그인해 주세요.' : undefined
  // 이메일은 URL 쿼리스트링이 아니라 signUp 액션이 심어둔 짧은 만료(60초) 쿠키에서 읽는다.
  const signupEmail = signedUp ? (await cookies()).get('signup_email')?.value : undefined

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center px-4 py-12">
      <AuthScreen initialError={error} initialInfo={info} initialEmail={signupEmail} />
    </div>
  )
}
