'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import ProfileMenu from '@/components/ProfileMenu'
import { BoxIcon, GiftIcon, UndoIcon } from '@/components/icons'

const TABS = [
  { href: '/', label: '있템', Icon: BoxIcon },
  { href: '/wishlist', label: '위시', Icon: GiftIcon },
  { href: '/used', label: '쓴템', Icon: UndoIcon },
]

interface SidebarProps {
  user: { nickname: string | null; email: string } | null
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  const isExcludedPage =
    pathname === '/login' ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/preview')
  if (isExcludedPage) return null

  return (
    <aside
      className="flex w-full flex-wrap items-center gap-2 border-b border-surface-border bg-surface px-4 py-3
                 md:sticky md:top-0 md:h-screen md:w-[248px] md:shrink-0 md:flex-col md:flex-nowrap
                 md:items-stretch md:justify-start md:gap-1.5 md:border-b-0 md:border-r md:px-[18px] md:py-[26px]"
    >
      <Link href="/" className="flex items-center gap-2 pr-2 md:w-full md:px-2 md:pb-[22px]">
        <Image src="/logo.png" alt="" width={30} height={30} className="rounded-lg" />
        <span className="text-lg font-extrabold tracking-tight text-accent-hover">이미 있어</span>
      </Link>

      <nav className="flex flex-1 items-center justify-center gap-1 md:w-full md:flex-none md:flex-col md:items-stretch md:justify-start">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors md:flex-none md:justify-start md:px-3.5 md:py-3 ${
                active
                  ? 'bg-accent-soft text-accent-hover'
                  : 'text-muted hover:bg-accent-soft/50 hover:text-foreground'
              }`}
            >
              <Icon className="h-[19px] w-[19px] shrink-0" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="hidden md:block md:flex-1" />

      {user && <ProfileMenu nickname={user.nickname} email={user.email} />}
    </aside>
  )
}
