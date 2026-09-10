'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { logClientError } from '@/lib/log-error'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // StrictMode 이중 실행에서도 1회만 기록. pathname만 저장 (쿼리 제외).
  const loggedRef = useRef(false)
  useEffect(() => {
    if (loggedRef.current) return
    loggedRef.current = true
    void logClientError({
      message: error.message,
      route: window.location.pathname,
      digest: error.digest,
    })
  }, [error])

  return (
    <div className="mx-auto w-full max-w-4xl animate-fade-in">
      <div className="rounded-2xl border border-surface-border bg-surface p-8 text-center">
        <h2 className="text-lg font-semibold">문제가 발생했어요</h2>
        <p className="mt-2 text-sm text-muted">
          {error.message || '알 수 없는 오류가 발생했어요. 잠시 후 다시 시도해 주세요.'}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
          >
            다시 시도
          </button>
          <Link
            href="/"
            className="rounded-xl border border-surface-border bg-input-bg px-4 py-2 text-sm font-medium hover:border-accent"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  )
}
