'use client'

import { useEffect, useRef, useState } from 'react'
import { HelpIcon } from '@/components/icons'
import { hasSeenHint, markHintSeen } from '@/lib/tooltip-hints'
import { useOnboardingStatus } from '@/components/OnboardingProvider'

interface HintBadgeProps {
  // localStorage seenTooltips에 쓰이는 고유 키 — 화면/요소별로 겹치지 않게 짓는다.
  id: string
  message: string
  className?: string
}

const TOOLTIP_WIDTH = 200
const VIEWPORT_MARGIN = 8

export default function HintBadge({ id, message, className }: HintBadgeProps) {
  const { isTourOpen, hasCompletedOnboarding } = useOnboardingStatus()
  const [open, setOpen] = useState(false)
  const [pulse, setPulse] = useState(false)
  // 카드 컴포넌트들이 대부분 overflow-hidden(펼침/접힘 애니메이션용)이라, absolute로 두면
  // 툴팁이 카드 경계에서 잘려 보인다. fixed + 좌표 계산으로 뷰포트 기준으로 띄워서 그 문제를 피한다.
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (hasSeenHint(id)) return
    markHintSeen(id)
    // 온보딩 투어를 이미 완료(또는 건너뛰기)한 사용자에게는 굳이 또 pulse로
    // 강조하지 않는다 — 투어에서 이미 관련 화면을 설명했기 때문. 배지 자체는 남긴다.
    if (!hasCompletedOnboarding) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPulse(true)
      const timer = setTimeout(() => setPulse(false), 2400)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        tooltipRef.current && !tooltipRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  function handleToggle(e: React.MouseEvent) {
    // Link나 form 안에 놓일 수 있으므로, 배지 클릭이 그 상위 동작(이동/제출)으로 번지지 않게 막는다.
    e.preventDefault()
    e.stopPropagation()
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const left = Math.max(
        VIEWPORT_MARGIN,
        Math.min(rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2, window.innerWidth - TOOLTIP_WIDTH - VIEWPORT_MARGIN)
      )
      setCoords({ top: rect.bottom + 6, left })
    }
    setOpen((v) => !v)
  }

  // 온보딩 투어 모달이 열려있는 동안에는 힌트 배지를 아예 숨긴다(동시 노출 금지).
  if (isTourOpen) return null

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-label="도움말 보기"
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent transition-colors hover:bg-accent hover:text-accent-foreground ${
          pulse ? 'animate-hint-pulse' : ''
        } ${className ?? ''}`}
      >
        <HelpIcon className="h-3 w-3" />
      </button>
      {open && coords && (
        <div
          ref={tooltipRef}
          role="tooltip"
          style={{ top: coords.top, left: coords.left, width: TOOLTIP_WIDTH }}
          className="fixed z-30 rounded-xl border border-surface-border bg-surface px-3 py-2 text-xs text-foreground shadow-lg"
        >
          {message}
        </div>
      )}
    </>
  )
}
