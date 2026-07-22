import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import WishlistItemForm from '@/components/WishlistItemForm'
import PendingOverlay from '@/components/PendingOverlay'
import { BackIcon } from '@/components/icons'
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

  const [{ data: item, error }, { data: categories, error: categoriesError }] = await Promise.all([
    supabase.from('wishlist_items').select('*').eq('id', id).eq('user_id', user.id).single<WishlistItem>(),
    supabase.rpc('list_wishlist_categories'),
  ])

  if (error || !item) notFound()
  if (categoriesError) throw new Error(categoriesError.message)

  const boundUpdate = updateWishlistItem.bind(null, id)
  const boundDelete = deleteWishlistItem.bind(null, id)

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
        <h1 className="text-lg font-semibold">위시 수정</h1>
      </div>
      <WishlistItemForm
        item={item}
        existingCategories={(categories ?? []) as string[]}
        action={boundUpdate}
        submitLabel="변경사항 저장"
      />
      <form action={boundDelete} className="relative">
        <PendingOverlay label="삭제하는 중..." />
        <button
          type="submit"
          className="w-full rounded-xl border border-dday-overdue/40 px-3 py-2 text-sm font-medium text-dday-overdue transition-colors hover:bg-dday-overdue-bg"
        >
          삭제
        </button>
      </form>
    </div>
  )
}
