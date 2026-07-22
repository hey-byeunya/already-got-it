'use client'

import { useFormStatus } from 'react-dom'
import CenteredSpinner from '@/components/CenteredSpinner'

export default function PendingOverlay({ label }: { label?: string }) {
  const { pending } = useFormStatus()

  if (!pending) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm">
      <CenteredSpinner label={label ?? '처리 중...'} />
    </div>
  )
}
