# 인증 플로우 (회원가입 확장 / 비밀번호 찾기)

회원가입·로그인·비밀번호 찾기 라우트와 인증 예외 경로 규칙. `app/login`, `app/forgot-password`,
`app/reset-password`, `lib/auth-errors.ts`, `lib/auth-routes.ts` 를 만질 때 읽는다.

- 회원가입 시 닉네임(2~20자)·약관동의 체크박스를 클라이언트(`components/AuthForm.tsx`)와 서버(`app/login/actions.ts`) 양쪽에서 검증한다. 닉네임은 `supabase.auth.signUp`의 `options.data.nickname`으로 `user_metadata`에 저장하며, 별도 프로필 테이블은 두지 않는다
- 약관/개인정보 처리방침 텍스트는 실제 문서가 없으므로 클릭 가능한 링크가 아닌 강조 텍스트로만 표시한다 — 존재하지 않는 문서로 연결되는 허위 링크를 만들지 않는다
- 비밀번호 찾기는 `/forgot-password`(이메일 입력 → `resetPasswordForEmail`) → `/reset-password`(새 비밀번호 입력 → `updateUser({ password })`) 두 단계로 구현한다. `/reset-password`는 Supabase 복구 링크가 URL 프래그먼트 토큰을 담고 오므로 반드시 브라우저 클라이언트(`lib/supabase/client.ts`)를 쓰는 클라이언트 컴포넌트여야 한다 (서버 클라이언트로는 토큰을 읽을 수 없음)
- Supabase 인증 에러를 한국어 안내 문구로 바꾸는 `translateAuthError`(+ `EMAIL_PATTERN`)는 `lib/auth-errors.ts`에 있다 — `app/login/actions.ts`, `app/forgot-password/actions.ts`가 공유해서 쓴다. 새로 raw `error.message`를 그대로 노출하지 말고 이 함수를 거친다. (단, `app/reset-password/page.tsx`는 예외 — 만료된 복구 링크가 지배적인 실패 양상이라 고정된 안내 문구를 그대로 쓴다.)
- 회원가입 직후 이메일 인증 대기 상태로 로그인 화면에 돌아올 때 이메일을 프리필해주는데, 이 이메일은 URL 쿼리스트링이 아니라 `signup_email`이라는 60초 만료 쿠키로 전달한다(`app/login/actions.ts`가 심고 `app/login/page.tsx`가 서버에서만 읽음) — 쿼리스트링에 이메일을 실으면 브라우저 히스토리/서버 로그에 남기 때문.
- `/forgot-password`, `/reset-password`는 로그인 세션 없이도 접근 가능해야 하므로 `lib/auth-routes.ts`의 `isAuthExemptPath`가 반환하는 인증 예외 경로에 포함되어 있다. 이 목록은 `lib/supabase/proxy.ts`와 `components/Sidebar.tsx` **양쪽에서 이 함수 하나만 공유해서 쓴다** — 예전에는 두 파일이 각자 다른 규칙(완전일치 vs 접두사 일치)으로 따로 판정하다가 사이드바가 로그인 화면에 잘못 나타나는 버그가 난 적이 있다. 인증이 필요한 새 라우트를 추가할 때 이 목록과 혼동하지 않고, 예외 경로를 늘릴 땐 반드시 `lib/auth-routes.ts` 한 곳만 고친다.
