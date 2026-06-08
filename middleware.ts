// middleware.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

// Inicializamos el entorno auth compatible con Edge
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  // En la v5, req.auth contiene el token si el usuario está logueado
  const isLoggedIn = !!req.auth; 
  
  const isOnLogin = req.nextUrl.pathname === "/login";
  const isOnLanding = req.nextUrl.pathname === "/";

  // 1. Si no está logueado y no está en login o landing -> Pa' fuera (al login)
  if (!isLoggedIn && !isOnLogin && !isOnLanding) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // 2. Si ya inició sesión e intenta volver a entrar al /login -> Al dashboard
  if (isLoggedIn && isOnLogin) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Mantiene tu mismo matcher exacto
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};