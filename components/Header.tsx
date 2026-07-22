'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions'
import { LogoutIcon, PouchIcon } from '@/components/icons'

const TABS = [
  { href: '/', label: '있템' },
  { href: '/wishlist', label: '위시' },
]

export default function Header() {
  const pathname = usePathname()

  if (pathname === '/login') return null

  return (
    <header className="border-b border-surface-border bg-surface/70 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
        <span className="flex items-center gap-1.5 font-semibold tracking-tight text-accent">
          <PouchIcon className="h-5 w-5" />
          이미 있어
        </span>
        <div className="flex items-center gap-3">
          <nav className="flex gap-1">
            {TABS.map((tab) => {
              const active = pathname === tab.href
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground/60 hover:bg-accent-soft hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </nav>
          <form action={signOut}>
            <button
              type="submit"
              aria-label="로그아웃"
              title="로그아웃"
              className="rounded-full p-1.5 text-muted hover:bg-dday-overdue-bg hover:text-dday-overdue"
            >
              <LogoutIcon className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
