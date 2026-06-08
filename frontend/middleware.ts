import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Better Auth secara otomatis menyimpan token sesi dalam cookie "better-auth.session_token"
  const sessionToken = request.cookies.get("better-auth.session_token");

  const { pathname } = request.nextUrl;

  // Daftar path yang membutuhkan autentikasi
  const protectedPaths = ["/dashboard", "/history", "/workspace", "/evaluation"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !sessionToken) {
    // Pengguna belum login, alihkan kembali ke landing page (/)
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/history/:path*",
    "/workspace/:path*",
    "/evaluation/:path*",
  ],
};
