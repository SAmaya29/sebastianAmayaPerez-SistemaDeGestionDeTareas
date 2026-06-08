import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) return NextResponse.json({ error: "projectId requerido" }, { status: 400 });

  const tareas = await prisma.task.findMany({
    where: { projectId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tareas);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      
  const { description, projectId, status, userId } = await req.json();
  if (!description || !projectId) return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });

  const assignedUserId = (session.user as any).role === "ADMIN" && userId
    ? userId
    : session.user.id;

  const tarea = await prisma.task.create({
    data: {
      description,
      projectId,
      status: status ?? "PENDING",
      userId: assignedUserId,
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(tarea);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id, status, userId } = await req.json();
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

  const tarea = await prisma.task.findUnique({ where: { id } });
  if (!tarea) return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
    
  const role = (session.user as any).role;
  const esAdmin = role === "ADMIN";
  const esAsignado = tarea.userId === session.user.id;

  if (!esAdmin && !esAsignado) {
    return NextResponse.json({ error: "Sin permisos para editar esta tarea" }, { status: 403 });
  }

  const data: any = {};
  if (status !== undefined) data.status = status;
  if (userId !== undefined && esAdmin) data.userId = userId;

  const actualizada = await prisma.task.update({
    where: { id },
    data,
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(actualizada);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Sin permisos" }, { status: 403 });

  const { id } = await req.json();
  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}