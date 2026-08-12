const SEEN_TOOLTIPS_KEY = 'already-got-it:seen-tooltips'

function readSeenIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(SEEN_TOOLTIPS_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function hasSeenHint(id: string): boolean {
  return readSeenIds().includes(id)
}

export function markHintSeen(id: string): void {
  if (typeof window === 'undefined') return
  const ids = readSeenIds()
  if (!ids.includes(id)) {
    window.localStorage.setItem(SEEN_TOOLTIPS_KEY, JSON.stringify([...ids, id]))
  }
}

export function resetAllHints(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(SEEN_TOOLTIPS_KEY)
}
