import AuthScreen from '@/components/AuthScreen'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center px-4 py-12">
      <AuthScreen initialError={error} />
    </div>
  )
}
