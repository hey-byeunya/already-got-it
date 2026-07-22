interface CenteredSpinnerProps {
  label?: string
  className?: string
}

export default function CenteredSpinner({ label = '불러오는 중...', className }: CenteredSpinnerProps) {
  return (
    <div
      role="status"
      className={`flex flex-1 flex-col items-center justify-center gap-3 py-24 text-muted ${className ?? ''}`}
    >
      <span
        className="h-8 w-8 animate-spin rounded-full border-2 border-surface-border border-t-accent"
        aria-hidden
      />
      <p className="text-sm">{label}</p>
    </div>
  )
}
