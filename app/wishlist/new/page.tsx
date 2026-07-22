import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import WishlistItemForm from '@/components/WishlistItemForm'
import { BackIcon } from '@/components/icons'
import { createWishlistItem } from './actions'

export default async function NewWishlistItemPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: categories, error } = await supabase.rpc('list_wishlist_categories')
  if (error) throw new Error(error.message)

  return (
    <div className="flex animate-fade-in flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link
          href="/wishlist"
          aria-label="위시 목록으로"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-foreground transition-colors hover:text-accent"
        >
          <BackIcon className="h-4 w-4" />
        </Link>
        <h1 className="text-lg font-semibold">위시 추가</h1>
      </div>
      <WishlistItemForm
        existingCategories={(categories ?? []) as string[]}
        action={createWishlistItem}
        submitLabel="위시에 담기"
      />
    </div>
  )
}
