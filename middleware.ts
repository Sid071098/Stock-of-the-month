import { NextResponse, type NextRequest } from "next/server";

const protectedPrefixes = ["/dashboard", "/history", "/analysis", "/admin"];

export function middleware(request: NextRequest) {
  const isProtected = protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix));

  if (!isProtected) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/history/:path*", "/analysis/:path*", "/admin/:path*"]
};
