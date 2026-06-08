import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = !!token;
  const isOnLogin = req.nextUrl.pathname === "/login";
  const isOnLanding = req.nextUrl.pathname === "/";

  if (!isLoggedIn && !isOnLogin && !isOnLanding) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && isOnLogin) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};