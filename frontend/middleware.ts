import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken = 
    request.cookies.get("better-auth.session_token") || 
    request.cookies.get("__Secure-better-auth.session_token");

  const protectedPaths = ["/dashboard", "/history", "/workspace", "/evaluation"];
  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(path + "/"));

  if (isProtected && !sessionToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/history",
    "/history/:path*",
    "/workspace",
    "/workspace/:path*",
    "/evaluation",
    "/evaluation/:path*",
  ],
};
