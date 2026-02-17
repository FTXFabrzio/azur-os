import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('auth_session')
  const { pathname } = request.nextUrl

  // Protected Admin Routes
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    try {
      const userData = JSON.parse(session.value)
      // Strict check: only 'fortex' can access /dashboard
      if (userData.username !== 'fortex') {
        const url = new URL('/work', request.url)
        url.searchParams.set('error', 'access_denied')
        return NextResponse.redirect(url)
      }
    } catch (e) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protected Work Routes
  if (pathname.startsWith('/work')) {
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/work/:path*'],
}
