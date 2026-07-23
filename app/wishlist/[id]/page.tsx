import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import WishlistItemForm from '@/components/WishlistItemForm'
import PendingOverlay from '@/components/PendingOverlay'
import { BackIcon, TrashIcon } from '@/components/icons'
import type { WishlistItem } from '@/types/wishlist-item'
import { deleteWishlistItem } from '../actions'
import { updateWishlistItem } from './actions'

export default async function EditWishlistItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 위시 카테고리 칩은 위시에서 이미 쓴 카테고리뿐 아니라 있템에서 이미 쓴 카테고리도 함께 보여준다
  // — 위시가 비어 있는 초기 상태에도 있템 쪽에 등록해둔 카테고리를 그대로 재사용할 수 있게 하기 위함.
  const [
    { data: item, error },
    { data: wishlistCategories, error: wishlistCategoriesError },
    { data: ownedCategories, error: ownedCategoriesError },
  ] = await Promise.all([
    supabase.from('wishlist_items').select('*').eq('id', id).eq('user_id', user.id).single<WishlistItem>(),
    supabase.rpc('list_wishlist_categories'),
    supabase.rpc('list_owned_categories'),
  ])

  if (error || !item) notFound()
  if (wishlistCategoriesError) throw new Error(wishlistCategoriesError.message)
  if (ownedCategoriesError) throw new Error(ownedCategoriesError.message)

  const categories = Array.from(new Set([...(wishlistCategories ?? []), ...(ownedCategories ?? [])])).sort()

  const boundUpdate = updateWishlistItem.bind(null, id)
  const boundDelete = deleteWishlistItem.bind(null, id)

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
          <h1 className="text-lg font-semibold">위시 수정</h1>
        </div>
        <div className="p-6">
          <WishlistItemForm
            item={item}
            existingCategories={categories}
            action={boundUpdate}
            submitLabel="변경사항 저장"
            secondaryAction={
              <form action={boundDelete} className="relative shrink-0">
                <PendingOverlay label="삭제하는 중..." />
                <button
                  type="submit"
                  className="flex h-full items-center gap-1.5 whitespace-nowrap rounded-xl border border-dday-overdue/40 px-4 py-2.5 text-sm font-medium text-dday-overdue transition-colors hover:bg-dday-overdue-bg"
                >
                  <TrashIcon className="h-4 w-4" />
                  삭제하기
                </button>
              </form>
            }
          />
        </div>
      </div>
    </div>
  )
}
