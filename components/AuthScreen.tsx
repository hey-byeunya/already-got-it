'use client'

import { useState } from 'react'
import AuthHeroPanel from '@/components/AuthHeroPanel'
import AuthForm from '@/components/AuthForm'

type Mode = 'signin' | 'signup'

export default function AuthScreen({
  initialError,
  initialInfo,
  initialEmail,
}: {
  initialError?: string
  initialInfo?: string
  initialEmail?: string
}) {
  const [mode, setMode] = useState<Mode>('signin')

  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-wrap overflow-hidden rounded-[28px] border border-surface-border bg-surface shadow-xl">
      <AuthHeroPanel mode={mode} />
      <div className="flex flex-1 basis-[420px] flex-col justify-center p-8 md:p-12">
        <div className="mx-auto flex w-full max-w-[400px] flex-col gap-5">
          <AuthForm
            mode={mode}
            onModeChange={setMode}
            initialError={initialError}
            initialInfo={initialInfo}
            initialEmail={initialEmail}
          />
        </div>
      </div>
    </div>
  )
}
