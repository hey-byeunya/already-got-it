'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { markOnboardingSeen } from '@/app/actions'
import OnboardingTour from '@/components/OnboardingTour'

interface OnboardingContextValue {
  open: () => void
  isOpen: boolean
  hasCompletedOnboarding: boolean
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

// ProfileMenu 등에서 "다시 보기" 버튼이 투어를 수동으로 다시 띄울 때 쓴다.
// 저장된 has_seen_onboarding 플래그는 건드리지 않는다 — 수동 재실행일 뿐이라
// 자동 트리거 로직(최초 진입 시 1회)을 다시 검증할 필요가 없기 때문.
export function useOnboardingReplay() {
  const ctx = useContext(OnboardingContext)
  return ctx?.open ?? (() => {})
}

// HintBadge 등이 "투어가 지금 열려있는지"(동시 노출 금지), "투어를 이미 끝냈는지"
// (완료자에게는 힌트 pulse 생략)를 판단할 때 쓴다. 컨텍스트가 없는 극단적인 경우엔
// 안전한 기본값(투어 안 열림, 완료된 것으로 간주 → pulse 안 함)을 반환한다.
export function useOnboardingStatus() {
  const ctx = useContext(OnboardingContext)
  return {
    isTourOpen: ctx?.isOpen ?? false,
    hasCompletedOnboarding: ctx?.hasCompletedOnboarding ?? true,
  }
}

export default function OnboardingProvider({
  children,
  initialShouldShow,
}: {
  children: ReactNode
  initialShouldShow: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(!initialShouldShow)
  const pathname = usePathname()

  useEffect(() => {
    // 있템 목록 화면(첫 진입 화면)이 렌더링된 직후에만, 약간의 지연을 두고 자연스럽게 띄운다.
    if (!initialShouldShow || pathname !== '/') return
    const timer = setTimeout(() => setIsOpen(true), 600)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleClose() {
    setIsOpen(false)
    setHasCompletedOnboarding(true)
    // 건너뛰기/완료 어느 쪽이든 "봤다"로 기록한다. 이미 true인 계정에는 멱등이라 문제 없다.
    void markOnboardingSeen()
  }

  return (
    <OnboardingContext.Provider value={{ open: () => setIsOpen(true), isOpen, hasCompletedOnboarding }}>
      {children}
      {isOpen && <OnboardingTour onClose={handleClose} />}
    </OnboardingContext.Provider>
  )
}
