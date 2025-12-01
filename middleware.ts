// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const protectedPages = ['/feed', '/upload'];
  const protectedApi = ['/api/video'];
  const authPages = ['/login', '/register'];

  // --- NEW LOGIC ---
  // Handle root page (/)
  if (pathname === '/') {
    if (token) {
      // Logged in user on root page -> redirect to feed
      return NextResponse.redirect(new URL('/feed', req.url));
    } else {
      // Not logged in user on root page -> redirect to login
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  // --- END NEW LOGIC ---

  // Handle auth pages ( /login, /register )
  if (authPages.includes(pathname)) {
    if (token) {
      // Logged in user on auth page -> redirect to feed
      return NextResponse.redirect(new URL('/feed', req.url));
    }
  }

  // Handle protected pages ( /feed, /upload )
  if (protectedPages.includes(pathname)) {
    if (!token) {
      // Not logged in user on protected page -> redirect to login
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Handle protected API routes
  if (protectedApi.some(path => pathname.startsWith(path))) {
    if (!token) {
      // Not logged in user on protected API -> return 401
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  // Allow other requests
  return NextResponse.next();
}

// Your existing config is perfect
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};