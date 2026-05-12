import { NextResponse, type NextRequest } from "next/server";

const protectedPrefixes = ["/dashboard", "/history", "/analysis", "/admin"];

export function middleware(request: NextRequest) {
  const isProtected = protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix));

  if (!isProtected || process.env.NEXT_PUBLIC_DISABLE_PAYWALL === "true") {
    return NextResponse.next();
  }

  const subscription = request.cookies.get("stockymonth_subscription")?.value;

  if (subscription === "active" || subscription === "trialing") {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.searchParams.set("subscribe", "required");
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*", "/history/:path*", "/analysis/:path*", "/admin/:path*"]
};
