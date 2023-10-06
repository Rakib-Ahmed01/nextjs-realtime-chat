import { getToken } from 'next-auth/jwt';
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// This function can be marked `async` if using `await` inside
export default withAuth(
  async function middleware(request) {
    const pathname = request.nextUrl.pathname;
    const isAuthenticated = await getToken({ req: request });

    const protectedRoutes = ['/dashboard'];
    const isLoginPage = pathname.startsWith('/login');
    const isAccessingProtectedRoute = protectedRoutes.includes(pathname);

    if (isLoginPage) {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return NextResponse.next();
    }

    if (isAccessingProtectedRoute && !isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  },
  {
    callbacks: {
      authorized: () => {
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/login/:path*',
  ],
};
