import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middlewareErrorHandler(error: unknown, request: NextRequest) {
  console.error('Authentication Error:', error);
  
  // Default error message
  let errorMessage = 'An unexpected error occurred';
  let redirectPath = '/auth-error';
  
  // Handle different types of errors
  if (error instanceof Error) {
    const errorName = error.name || 'Error';
    const errorCode = errorName.toLowerCase();
    
    // Map common Clerk errors to user-friendly messages
    const errorMap: Record<string, string> = {
      'clerkautherror': 'Authentication failed. Please try again.',
      'clerkwebapierror': 'Could not connect to authentication service.',
      'clerkjwtinvalid': 'Your session is invalid. Please sign in again.',
      'clerkjwtmalformed': 'Session error. Please sign in again.',
      'clerkjwtexpired': 'Your session has expired. Please sign in again.',
      'clerkjwtrevoked': 'Your session was revoked. Please sign in again.',
    };
    
    errorMessage = errorMap[errorCode] || error.message || errorName;
    
    // Add error code to the redirect URL for the error page
    redirectPath = `/auth-error?error=${encodeURIComponent(errorCode)}`;
  }
  
  // For API routes, return a JSON response
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: errorMessage },
      { status: 401 }
    );
  }
  
  // For page routes, redirect to the error page
  const redirectUrl = new URL(redirectPath, request.url);
  // Preserve the original URL for redirecting back after login
  redirectUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
  
  return NextResponse.redirect(redirectUrl);
}

// Helper to wrap middleware functions with error handling
export function withErrorHandler(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      return await handler(request);
    } catch (error) {
      return middlewareErrorHandler(error, request);
    }
  };
}
