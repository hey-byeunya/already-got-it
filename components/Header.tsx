'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions'

const TABS = [
  { href: '/', label: '보유템' },
  { href: '/wishlist', label: '위시리스트' },
]

export default function Header() {
  const pathname = usePathname()

  if (pathname === '/login') return null

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
        <span className="font-semibold">이미 있어</span>
        <div className="flex items-center gap-3">
          <nav className="flex gap-1">
            {TABS.map((tab) => {
              const active = pathname === tab.href
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-black/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10'
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
              className="text-sm text-black/50 hover:text-black/80 dark:text-white/50 dark:hover:text-white/80"
            >
              로그아웃
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
