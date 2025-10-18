import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/shared-auth-middleware";
import { urls } from "@/lib/urls";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow root page and public assets to be public
  const publicPaths = [
    "/manifest.webmanifest",
    "/manifest.json",
    "/site.webmanifest",
    "/robots.txt",
    "/sitemap.xml",
  ];

  // Check for exact match on root or startsWith for other public paths
  if (pathname === "/" || publicPaths.some(path => pathname === path || pathname.startsWith(path)) || pathname.startsWith("/public/")) {
    return NextResponse.next();
  }

  // Allow auth callback endpoint without authentication
  if (pathname === "/api/auth/callback") {
    return NextResponse.next();
  }

  // For API routes, validate token but don't redirect (just add headers or return 401)
  if (pathname.startsWith("/api")) {
    // Check for NextAuth session cookie on shared .nocage.in domain
    const authToken = request.cookies.get('next-auth.session-token')?.value;

    if (!authToken) {
      // For API routes without token, still let them through but without user headers
      // The API route itself can decide to return 401
      return NextResponse.next();
    }

    // Validate token with auth service
    try {
      const response = await fetch(`${urls.AUTH_URL}/api/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: authToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.user;

        // Add user info to request headers
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', user.id);
        requestHeaders.set('x-user-email', user.email);
        requestHeaders.set('x-user-name', user.name || '');
        requestHeaders.set('x-user-capsule-enrolled', user.capsuleEnrolled.toString());
        requestHeaders.set('x-user-business-enrolled', user.businessEnrolled.toString());

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      }
    } catch (error) {
      console.error('Token validation error:', error);
    }

    // If validation fails, continue without headers
    return NextResponse.next();
  }

  // For page routes, check for NextAuth session cookie
  const authToken = request.cookies.get('next-auth.session-token')?.value;

  if (!authToken) {
    // No session cookie - redirect to auth service login
    const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
    const publicUrl = `${forwardedProto}://${forwardedHost}${pathname}`;
    const callbackUrl = encodeURIComponent(publicUrl);
    const loginUrl = `${urls.AUTH_URL}/login?callbackUrl=${callbackUrl}`;
    return NextResponse.redirect(loginUrl);
  }

  // Session cookie exists - allow access (NextAuth will handle validation on the client)
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.ico).*)"],
};
