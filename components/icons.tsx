type IconProps = { className?: string }

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" className={className}>
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="M16 16l-3.6-3.6" />
    </svg>
  )
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5.5 8l4.5 4.5L14.5 8" />
    </svg>
  )
}

export function HourglassIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 3h8M6 17h8" />
      <path d="M6 3c0 3 2.2 4.3 4 5.5C8.2 9.7 6 11 6 14M14 3c0 3-2.2 4.3-4 5.5 1.8 1.2 4 2.5 4 5.5" />
    </svg>
  )
}

export function AlertIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10 2.5 18 16H2z" />
      <path d="M10 8v3.2" />
      <circle cx="10" cy="13.6" r="0.15" fill="currentColor" />
    </svg>
  )
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4.5" width="14" height="12" rx="2" />
      <path d="M3 8.5h14M7 2.5v3M13 2.5v3" />
    </svg>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 10.5l4 4 8-9" />
    </svg>
  )
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 6h12M8 6V4.5h4V6M6 6l.7 9.5A1.5 1.5 0 0 0 8.2 17h3.6a1.5 1.5 0 0 0 1.5-1.5L14 6" />
    </svg>
  )
}

export function LogoutIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8 3H4.5A1.5 1.5 0 0 0 3 4.5v11A1.5 1.5 0 0 0 4.5 17H8" />
      <path d="M13 14l4-4-4-4M17 10H7.5" />
    </svg>
  )
}

export function BoxIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6.5 10 3l7 3.5-7 3.5-7-3.5Z" />
      <path d="M3 6.5V14l7 3.5V10M17 6.5V14l-7 3.5" />
    </svg>
  )
}

export function PersonIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="6.5" r="3.3" />
      <path d="M3.5 17.5a6.5 6.5 0 0 1 13 0" />
    </svg>
  )
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className={className}>
      <path d="M10 4v12M4 10h12" />
    </svg>
  )
}

export function BackIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.5 15 7 10l5.5-5" />
    </svg>
  )
}

export function GiftIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="8" width="14" height="9.5" rx="1.5" />
      <path d="M3 11.5h14" />
      <path d="M10 8v9.5" />
      <path d="M10 8C7.5 8 6.5 6.5 7 5.2 7.4 4.2 9 4.3 10 8Z" />
      <path d="M10 8c2.5 0 3.5-1.5 3-2.8-.4-1-2-.9-3 2.8Z" />
    </svg>
  )
}

export function UndoIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 8H12.5A4 4 0 0 1 12.5 16H9" />
      <path d="M8 4.5 4.5 8 8 11.5" />
    </svg>
  )
}

export function LinkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8.3 11.7a3.7 3.7 0 0 0 5.6 0l2.1-2.1a3.7 3.7 0 0 0-5.2-5.2l-.7.7" />
      <path d="M11.7 8.3a3.7 3.7 0 0 0-5.6 0l-2.1 2.1a3.7 3.7 0 0 0 5.2 5.2l.7-.7" />
    </svg>
  )
}
