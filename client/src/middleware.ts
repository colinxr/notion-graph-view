import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Create a matcher for public routes
const isPublicRoute = createRouteMatcher([
  '/',                    // Home page
  '/login(.*)',           // Login page and all subpaths
  '/register(.*)',        // Register page and all subpaths
  '/sso-callback(.*)',    // SSO callback page
  '/api/auth/(.*)',       // Auth API routes
]);

export default clerkMiddleware((auth, req) => {
  // If it's a public route, skip authentication checks
  if (isPublicRoute(req)) {
    return;
  }
  
  // For protected routes, authentication is enforced automatically
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};