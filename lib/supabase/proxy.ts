import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isLoginPage = request.nextUrl.pathname.startsWith('/login')
  const isPreviewPage = request.nextUrl.pathname.startsWith('/preview')
  const isPublicAuthPage =
    request.nextUrl.pathname.startsWith('/forgot-password') ||
    request.nextUrl.pathname.startsWith('/reset-password')

  if (!user && !isLoginPage && !isPreviewPage && !isPublicAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const redirectResponse = NextResponse.redirect(url)
    redirectResponse.headers.set('Cache-Control', 'no-store')
    return redirectResponse
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    const redirectResponse = NextResponse.redirect(url)
    redirectResponse.headers.set('Cache-Control', 'no-store')
    return redirectResponse
  }

  // 로그인 화면을 포함해 이 앱의 모든 페이지는 사용자별 세션 상태를 반영하므로,
  // 브라우저/중간 캐시가 이전 사용자의 렌더 결과를 다음 사용자에게 그대로 재사용해
  // 보여주는 일이 없도록 항상 no-store를 강제한다.
  response.headers.set('Cache-Control', 'no-store')
  return response
}
