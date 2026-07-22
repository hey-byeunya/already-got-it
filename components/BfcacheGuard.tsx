'use client'

import { useEffect } from 'react'

// 뒤로/앞으로가기 캐시(bfcache)는 페이지를 서버에 다시 요청하지 않고 브라우저 메모리에
// 있던 스냅샷을 그대로 복원한다 — 그래서 로그아웃 이후 뒤로가기를 누르면, 로그아웃 이전에
// 렌더돼 있던(이전 사용자 데이터가 담긴) 화면이 순간적으로 그대로 보일 수 있다.
// pageshow 이벤트의 event.persisted가 true면 bfcache 복원이라는 뜻이므로, 그 경우
// 강제로 새로고침해 서버에 다시 요청한다. 그러면 proxy.ts/각 페이지의 인증 체크가 다시
// 실행되어 세션이 끊겼으면 로그인 화면으로, 유효하면 최신 데이터로 다시 렌더링된다.
export default function BfcacheGuard() {
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        window.location.reload()
      }
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  return null
}
