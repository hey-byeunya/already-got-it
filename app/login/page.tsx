import AuthScreen from '@/components/AuthScreen'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; signedUp?: string; email?: string }>
}) {
  const { error, signedUp, email } = await searchParams
  const info = signedUp ? '가입 확인 메일을 보냈어요. 메일함에서 인증을 완료한 뒤 로그인해 주세요.' : undefined

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center px-4 py-12">
      <AuthScreen initialError={error} initialInfo={info} initialEmail={signedUp ? email : undefined} />
    </div>
  )
}
