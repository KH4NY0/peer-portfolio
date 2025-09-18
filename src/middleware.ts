import { clerkMiddleware, type NextRequest } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/auth-error(.*)',
  '/api/trpc/[trpc]',
  '/api/webhooks(.*)',
  '/_next/static(.*)',
  '/_next/image(.*)',
  '/favicon.ico',
];

// Create the middleware
export default clerkMiddleware(async (auth, req: NextRequest) => {
  try {
    const { userId, sessionClaims } = await auth();
    const { pathname } = req.nextUrl;

    // Skip middleware for public routes and static files
    const isPublicRoute = publicRoutes.some(route => {
      const regex = new RegExp(`^${route.replace(/\*/g, '.*')}$`);
      return regex.test(pathname);
    });

    if (isPublicRoute || pathname.includes('.')) {
      return NextResponse.next();
    }

    // Handle unauthenticated users
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Handle users without a username
    if (!sessionClaims?.username && !pathname.startsWith('/account/username')) {
      const usernameSetupUrl = new URL('/account/username', req.url);
      usernameSetupUrl.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(usernameSetupUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Authentication error:', error);
    const errorUrl = new URL('/auth-error', req.url);
    errorUrl.searchParams.set('error', 'authentication_error');
    return NextResponse.redirect(errorUrl);
  }
});

// Configure which routes to run middleware on
export const config = {
  matcher: [
    // Match all paths except for ones starting with _next or containing a dot (static files)
    "/((?!.*\..*|_next).*)",
    // Also match API routes
    "/api/(.*)",
  ],
};
