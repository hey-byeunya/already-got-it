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

  // 위시 카테고리 칩은 위시에서 이미 쓴 카테고리뿐 아니라 있템에서 이미 쓴 카테고리도 함께 보여준다
  // — 위시가 비어 있는 초기 상태에도 있템 쪽에 등록해둔 카테고리를 그대로 재사용할 수 있게 하기 위함.
  const [{ data: wishlistCategories, error: wishlistCategoriesError }, { data: ownedCategories, error: ownedCategoriesError }] =
    await Promise.all([supabase.rpc('list_wishlist_categories'), supabase.rpc('list_owned_categories')])
  if (wishlistCategoriesError) throw new Error(wishlistCategoriesError.message)
  if (ownedCategoriesError) throw new Error(ownedCategoriesError.message)

  const categories = Array.from(new Set([...(wishlistCategories ?? []), ...(ownedCategories ?? [])])).sort()

  return (
    <div className="mx-auto flex w-full max-w-4xl animate-fade-in flex-col gap-4">
      <div className="overflow-hidden rounded-[28px] border border-surface-border bg-surface">
        <div className="flex items-center gap-3 border-b border-surface-border px-6 py-5">
          <Link
            href="/wishlist"
            aria-label="위시 목록으로"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-foreground transition-colors hover:text-accent"
          >
            <BackIcon className="h-4 w-4" />
          </Link>
          <h1 className="text-lg font-semibold">위시 추가</h1>
        </div>
        <div className="p-6">
          <WishlistItemForm existingCategories={categories} action={createWishlistItem} submitLabel="위시에 담기" />
        </div>
      </div>
    </div>
  )
}
