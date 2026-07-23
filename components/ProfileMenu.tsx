'use client'

import { useEffect, useRef, useState } from 'react'
import { signOut } from '@/app/actions'
import { clearClientSessionState } from '@/lib/client-session'
import { LogoutIcon, PersonIcon } from '@/components/icons'

// 서버 액션(signOut)은 쿠키 세션만 정리한다. 여기서는 그 뒤에 이어서
// (1) 이전 사용자의 흔적이 될 수 있는 클라이언트 저장값을 지우고
// (2) location.href로 완전히 새로고침해 로그인 화면으로 이동한다.
// router.push 같은 클라이언트 사이드 전환 대신 전체 페이지 새로고침을 쓰는 이유:
// 있템/위시 목록 컴포넌트의 React state와 Next.js의 라우터 캐시가 메모리에 남아있으면,
// 같은 브라우저 탭에서 곧바로 다른 계정으로 로그인했을 때 그 잔여 상태가 잠깐(또는 계속)
// 화면에 비칠 수 있다 — 전체 새로고침은 JS 런타임 자체를 새로 띄우므로 이 위험을 원천 차단한다.
async function handleSignOut() {
  await signOut()
  clearClientSessionState()
  window.location.href = '/login'
}

interface ProfileMenuProps {
  nickname: string | null
  email: string
}

export default function ProfileMenu({ nickname, email }: ProfileMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={containerRef} className="relative md:w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="프로필 메뉴"
        className="flex items-center gap-2.5 rounded-full p-1.5 text-muted transition-colors hover:text-accent
                   md:w-full md:rounded-2xl md:border md:border-surface-border md:bg-background md:p-3 md:hover:text-foreground"
      >
        <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
          <PersonIcon className="h-[19px] w-[19px]" />
        </span>
        <span className="hidden min-w-0 flex-1 text-left md:block">
          <span className="block truncate text-sm font-bold text-foreground">{nickname ?? '이미 있어 사용자'}</span>
          <span className="block truncate text-xs text-muted">{email}</span>
        </span>
      </button>
      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] z-20 w-56 rounded-2xl border border-surface-border bg-surface p-3 shadow-lg
                     md:bottom-[calc(100%+8px)] md:left-0 md:right-auto md:top-auto md:w-full"
        >
          <p className="truncate px-1 text-sm font-bold md:hidden">{nickname ?? '이미 있어 사용자'}</p>
          <p className="truncate px-1 text-xs text-muted md:hidden">{email}</p>
          <form action={handleSignOut} className="mt-2 border-t border-surface-border pt-2 md:mt-0 md:border-t-0 md:pt-0">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm font-medium text-dday-overdue transition-colors hover:bg-dday-overdue-bg"
            >
              <LogoutIcon className="h-4 w-4" />
              로그아웃
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
