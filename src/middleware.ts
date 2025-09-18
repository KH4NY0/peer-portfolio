import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from 'next/server';

// Development-specific configurations
if (process.env.NODE_ENV === 'development') {
  // Add clock skew handling
  const originalDate = global.Date;
  global.Date = class extends Date {
    constructor() {
      super();
      // Add a 5-minute buffer to account for clock skew
      return new originalDate(originalDate.now() + 1000 * 60 * 5);
    }
  } as DateConstructor;
  
  // Copy static methods
  Object.assign(global.Date, originalDate);
}

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/trpc/(.*)',
  '/api/webhooks/(.*)',
  '/_next/static(.*)',
  '/_next/image(.*)',
  '/favicon.ico',
];

// Create a matcher for public routes
const isPublicRoute = createRouteMatcher(publicRoutes);

// Create the middleware
export default clerkMiddleware(async (auth, req) => {
  // Get the session
  const session = await auth();
  const { pathname } = req.nextUrl;

  // Skip middleware for public routes and static files
  if (isPublicRoute(req) || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Handle unauthenticated users
  if (!session.userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Get session claims
  const sessionClaims = session.sessionClaims;
  
  // Handle users without a username
  if (sessionClaims && !sessionClaims.username && !pathname.startsWith('/account/username')) {
    const usernameSetupUrl = new URL('/account/username', req.url);
    usernameSetupUrl.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(usernameSetupUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!.*\..*|_next).*)',
    '/',
  ],
};
