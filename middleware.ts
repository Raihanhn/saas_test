import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/images")
  ) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/api/stripe") ||
    pathname.startsWith("/payment") ||
    pathname.startsWith("/webhook")
  ) {
    return NextResponse.next();
  }

  if (token) {
    if (
      pathname === "/" ||
      pathname.startsWith("/auth/login") ||
      pathname.startsWith("/auth/register")
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (!token) {
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",                     
    "/dashboard/:path*",     
    "/auth/login",
    "/auth/register",
    "/payment/:path*",        
  ],
};
