// lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "../auth.config"; // 1. Importamos la configuración base

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig, // 2. Aquí arrastramos de golpe session, pages, etc.
  
  // 3. Añadimos los callbacks de roles que tenías originalmente
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.image = (user as any).image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        session.user.image = token.image as string;
      }
      return session;
    },
  },
  
  // 4. Llenamos los proveedores con tu lógica de Supabase
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        
        if (!user) return null;
        
        const passwordMatch = bcrypt.compareSync(
          credentials.password as string,
          user.password
        );
        
        if (!passwordMatch) return null;
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
});