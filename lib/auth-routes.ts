// 로그인 세션 없이도(혹은 세션과 무관하게) 접근 가능해야 하는 경로 판정. Sidebar.tsx와 proxy.ts가
// 각자 다른 규칙(완전일치 vs startsWith)으로 이 목록을 따로 유지하다 사이드바가 로그인 화면에
// 잘못 나타나는 버그가 난 적이 있어, 하나의 함수로 통합해 두 곳이 항상 같은 판정을 내리게 한다.
export function isAuthExemptPath(pathname: string): boolean {
  return (
    pathname.startsWith('/login') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/preview')
  )
}
