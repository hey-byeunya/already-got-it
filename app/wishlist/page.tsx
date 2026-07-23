import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import WishlistItemList from '@/components/WishlistItemList'
import { PlusIcon } from '@/components/icons'
import type { WishlistItem } from '@/types/wishlist-item'
import { deleteWishlistItem, markWishlistPurchased } from './actions'

export default async function WishlistPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error: actionError } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase.rpc('list_wishlist_items', { p_search: null })
  if (error) throw new Error(error.message)

  const items = (data ?? []) as WishlistItem[]

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">위시</h1>
          <p className="mt-1 text-sm text-muted">사기 전에 한 번 더 생각할 것들</p>
        </div>
        <Link
          href="/wishlist/new"
          className="flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground shadow-sm transition-colors hover:bg-accent-hover"
        >
          <PlusIcon className="h-4 w-4" />
          추가
        </Link>
      </div>
      {actionError && (
        <p role="alert" className="rounded-xl bg-dday-overdue-bg px-3 py-2 text-sm text-dday-overdue">
          {actionError}
        </p>
      )}
      <WishlistItemList
        items={items}
        markPurchased={markWishlistPurchased}
        deleteItem={deleteWishlistItem}
      />
    </div>
  )
}
