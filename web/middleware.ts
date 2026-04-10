export { auth as middleware } from '@/auth'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/log/:path*',
    '/suggest/:path*',
    '/chat/:path*',
    '/habits/:path*',
    '/insights/:path*',
    '/goals/:path*',
  ],
}
