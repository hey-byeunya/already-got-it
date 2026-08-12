'use client'

import { useEffect, useState, type ComponentType } from 'react'
import { BoxIcon, GiftIcon, UndoIcon } from '@/components/icons'

interface Step {
  Icon: ComponentType<{ className?: string }> | null
  title: string
  body: string
}

const STEPS: Step[] = [
  {
    Icon: null,
    title: '"이미 있어"에 오신 걸 환영해요',
    body: '이미 가진 물건을 깜빡하고 또 사는 걸 막아주는 개인 재고 관리 앱이에요.',
  },
  {
    Icon: BoxIcon,
    title: '있템 — 가진 물건 한눈에',
    body: '등록한 물건을 목록으로 보고, −/+ 버튼으로 수량을 바로 조절할 수 있어요. 사용기한이 임박하면 카드 색으로 알려드려요.',
  },
  {
    Icon: GiftIcon,
    title: '위시 — 사고 싶은 것부터 담아두기',
    body: '충동구매하기 전에 여기 먼저 담아두세요. 실제로 사면 있템으로 옮길 수 있어요.',
  },
  {
    Icon: UndoIcon,
    title: '쓴템 — 다 쓴 물건 모아보기',
    body: '다 쓴 물건은 여기 모이고, 필요하면 되돌리기로 다시 있템으로 가져올 수 있어요.',
  },
]

export default function OnboardingTour({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0)
  const isLast = step === STEPS.length - 1

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const current = STEPS[step]
  const { Icon } = current

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-tour-title"
        className="animate-fade-in w-full max-w-sm rounded-2xl border border-surface-border bg-surface p-6 shadow-lg"
      >
        {Icon && (
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Icon className="h-5 w-5" />
          </span>
        )}

        <h2 id="onboarding-tour-title" className="text-lg font-bold text-foreground">
          {current.title}
        </h2>
        <p className="mt-2 text-sm text-muted">{current.body}</p>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            건너뛰기
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">
              {step + 1}/{STEPS.length}
            </span>
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="rounded-xl border border-surface-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-background"
              >
                이전
              </button>
            )}
            <button
              type="button"
              onClick={() => (isLast ? onClose() : setStep((s) => s + 1))}
              className="rounded-xl bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground shadow-sm transition-colors hover:bg-accent-hover"
            >
              {isLast ? '시작하기' : '다음'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
