// 로그아웃 시에도 남아있어야 하는 유일한 클라이언트 저장값. 로그인 화면의 "이메일 저장"
// 기능은 다음에 오는 사용자(같은 기기의 다른 사람일 수도 있음)에게 자동완성용으로만
// 쓰이므로 의도적으로 지우지 않는다 — 그 외의 모든 클라이언트 저장값은 이전 사용자의
// 흔적이므로 로그아웃 시 반드시 제거해야 한다.
export const REMEMBERED_EMAIL_KEY = 'already-got-it:remembered-email'

// 로그아웃 시 호출. sessionStorage는 통째로 비우고, localStorage는 REMEMBERED_EMAIL_KEY만
// 남기고 전부 지운다 — 이렇게 "허용 목록" 대신 "예외 하나만 남기고 전부 삭제" 방식으로
// 짜야, 나중에 새로운 localStorage 키가 추가되더라도 지우는 걸 깜빡해 이전 사용자 데이터가
// 남는 사고를 막을 수 있다.
export function clearClientSessionState() {
  if (typeof window === 'undefined') return

  window.sessionStorage.clear()

  const keysToRemove: string[] = []
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i)
    if (key && key !== REMEMBERED_EMAIL_KEY) keysToRemove.push(key)
  }
  keysToRemove.forEach((key) => window.localStorage.removeItem(key))
}
