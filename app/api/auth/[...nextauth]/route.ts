// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";

// Forzamos a que las rutas de autenticación usen Node.js normal y no Edge, 
// permitiendo que Prisma se conecte a Supabase sin romper el servidor.
export const runtime = "nodejs"; 

export const { GET, POST } = handlers;