// auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [], // Requerido por la interfaz, lo llenamos en lib/auth.ts
} satisfies NextAuthConfig;