'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import ProfileMenu from '@/components/ProfileMenu'

const TABS = [
  { href: '/', label: '있템' },
  { href: '/wishlist', label: '위시' },
  { href: '/used', label: '쓴템' },
]

interface HeaderProps {
  user: { nickname: string | null; email: string } | null
}

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname()

  const isAuthFlowPage =
    pathname === '/login' || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password')
  if (isAuthFlowPage) return null

  return (
    <header className="border-b border-surface-border bg-surface/70 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
        <span className="flex items-center gap-1.5 font-extrabold tracking-tight text-accent">
          <Image src="/logo.png" alt="" width={22} height={22} className="rounded-sm" />
          이미 있어
        </span>
        <div className="flex items-center gap-3">
          <nav className="flex gap-1 rounded-full bg-accent-soft/60 p-1">
            {TABS.map((tab) => {
              const active = pathname === tab.href
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-surface text-accent shadow-sm'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </nav>
          {user && <ProfileMenu nickname={user.nickname} email={user.email} />}
        </div>
      </div>
    </header>
  )
}
