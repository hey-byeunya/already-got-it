'use client'

import { OWNED_ITEM_STATUSES, type OwnedItemStatus } from '@/types/owned-item'

interface StatusStepperProps {
  status: OwnedItemStatus
  onChange: (status: OwnedItemStatus) => void
}

/** 목록 카드용 — 진행형 세그먼트 바 + 라벨. 원하는 단계를 바로 클릭해 이동할 수 있다. */
export function StatusStepper({ status, onChange }: StatusStepperProps) {
  const currentIndex = OWNED_ITEM_STATUSES.indexOf(status)

  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex gap-1.5">
        {OWNED_ITEM_STATUSES.map((s, i) => (
          <button
            key={s}
            type="button"
            aria-label={`${s} 상태로 변경`}
            onClick={() => onChange(s)}
            className={`h-[7px] flex-1 rounded-full transition-colors ${i <= currentIndex ? 'bg-accent' : 'bg-surface-border'}`}
          />
        ))}
      </div>
      <div className="flex gap-1.5">
        {OWNED_ITEM_STATUSES.map((s, i) => {
          const active = i === currentIndex
          const passed = i <= currentIndex
          return (
            <button
              key={s}
              type="button"
              onClick={() => onChange(s)}
              className={`flex-1 text-center text-[11.5px] transition-colors ${
                active ? 'font-bold text-accent' : passed ? 'font-medium text-accent/60' : 'text-muted'
              }`}
            >
              {s}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** 등록/수정 폼용 — 3분할 세그먼트 컨트롤. 값은 name="status"인 hidden input으로 제출된다. */
export function StatusSegmentedControl({ status, onChange }: StatusStepperProps) {
  return (
    <div className="flex gap-1 rounded-xl bg-accent-soft/60 p-1">
      {OWNED_ITEM_STATUSES.map((s) => {
        const active = s === status
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={`flex-1 rounded-lg py-2.5 text-sm transition-colors ${
              active ? 'bg-accent font-bold text-accent-foreground' : 'font-medium text-muted hover:text-foreground'
            }`}
          >
            {s}
          </button>
        )
      })}
    </div>
  )
}
