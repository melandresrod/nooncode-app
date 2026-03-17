import { NextResponse, type NextRequest } from 'next/server'
import { hasSupabasePublicEnv, isSupabaseAuthEnabled } from '@/lib/env'
import { isProtectedDashboardPath } from '@/lib/server/auth/policy'

export async function middleware(request: NextRequest) {
  if (!isProtectedDashboardPath(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  if (!isSupabaseAuthEnabled() || !hasSupabasePublicEnv()) {
    return NextResponse.next()
  }

  // Phase 1A scaffold only:
  // session refresh and redirect enforcement are intentionally deferred
  // until the real login/session flow is wired to Supabase.
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
