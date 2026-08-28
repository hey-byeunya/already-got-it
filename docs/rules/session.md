# 세션 격리 / 로그아웃

로그아웃 시 이전 계정 데이터가 남지 않게 하는 규칙. `components/ProfileMenu.tsx`,
`lib/client-session.ts`, `components/BfcacheGuard.tsx`, `lib/supabase/proxy.ts` 를 만질 때 읽는다.

- 로그아웃은 `components/ProfileMenu.tsx`의 클라이언트 래퍼(`handleSignOut`)가 처리한다: 서버 액션(`signOut`, 쿠키만 정리)을 `await`한 뒤 `lib/client-session.ts`의 `clearClientSessionState()`로 로컬/세션 스토리지를 정리(이메일 저장 값 제외)하고, `window.location.href = '/login'`로 **전체 페이지 새로고침**한다. `router.push`류의 클라이언트 사이드 전환을 쓰지 않는 이유: 같은 탭에서 곧바로 다른 계정으로 로그인했을 때 React state나 Next.js 라우터 캐시에 남은 이전 사용자 데이터가 잠깐이라도 보이는 걸 막기 위함이다. 새 클라이언트 저장값을 추가할 때는 로그아웃 시에도 지워지도록 반드시 `clearClientSessionState()` 대상에 포함시킨다(이메일 저장 키만 예외).
- 서버 액션에서 `!user`(세션 만료 등)를 확인할 때는 `throw new Error(...)`가 아니라 `redirect('/login')`을 쓴다 — 던지면 화면에 에러 화면이 뜨면서 그 뒤에 이전 데이터가 계속 표시될 수 있다.
- `components/BfcacheGuard.tsx`(전 페이지에 마운트됨)가 브라우저 뒤로가기 bfcache 복원을 감지해(`pageshow`의 `event.persisted`) 강제로 새로고침한다 — 로그아웃 이전 화면이 캐시에서 그대로 뜨는 것을 막기 위함. `lib/supabase/proxy.ts`도 모든 응답에 `Cache-Control: no-store`를 강제한다.
