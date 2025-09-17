import { clerkMiddleware } from "@clerk/nextjs/server";

// Run Clerk on all app routes (excluding static files and Next internals)
// and on API routes so `auth()` works reliably across the app.
export default clerkMiddleware();

export const config = {
  matcher: [
    // Match all paths except for ones starting with _next or containing a dot (static files)
    "/((?!.*\\..*|_next).*)",
    // Also match API routes
    "/api/(.*)",
  ],
};
