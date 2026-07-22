import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import WishlistItemList from '@/components/WishlistItemList'
import type { WishlistItem } from '@/types/wishlist-item'
import { deleteWishlistItem, markWishlistPurchased } from './actions'

export default async function WishlistPage() {
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
        <h1 className="text-lg font-semibold">위시리스트</h1>
        <Link
          href="/wishlist/new"
          className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-black"
        >
          + 추가
        </Link>
      </div>
      <WishlistItemList
        items={items}
        markPurchased={markWishlistPurchased}
        deleteItem={deleteWishlistItem}
      />
    </div>
  )
}
