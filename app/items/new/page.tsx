import OwnedItemForm from '@/components/OwnedItemForm'
import { createOwnedItem } from './actions'

export default function NewOwnedItemPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">있템 추가</h1>
      <OwnedItemForm action={createOwnedItem} submitLabel="등록" />
    </div>
  )
}
