import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - obtener todos los usuarios
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const usuarios = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(usuarios);
}

// PATCH - actualizar usuario
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const { id, role, email, name } = await req.json();
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

  const usuario = await prisma.user.update({
    where: { id },
    data: {
      ...(role && { role }),
      ...(email && { email }),
      ...(name && { name }),
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json(usuario);
}