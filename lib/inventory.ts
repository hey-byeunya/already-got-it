// today를 주입 가능하게 해 테스트에서 고정된 날짜로 결정적으로 검증할 수 있게 한다.
// 생략하면(운영 코드 대부분) 실제 오늘 날짜를 쓴다.
export function daysUntil(dateStr: string, today: Date = new Date()): number {
  const start = new Date(today)
  start.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

export function formatDday(days: number): string {
  if (days >= 0) return `D-${days}`
  return `경과 ${Math.abs(days)}일`
}

export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}
