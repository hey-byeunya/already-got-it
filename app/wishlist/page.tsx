import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import WishlistItemList from '@/components/WishlistItemList'
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted">WISH LIST</p>
          <h1 className="text-xl font-semibold tracking-tight">위시</h1>
        </div>
        <Link
          href="/wishlist/new"
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-sm transition-colors hover:bg-accent-hover"
        >
          + 추가
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
