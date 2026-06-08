import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const [totalProyectos, totalTareas, tareasCompletadas, totalUsuarios] = await Promise.all([
    prisma.project.count(),
    prisma.task.count(),
    prisma.task.count({ where: { status: "COMPLETED" } }),
    prisma.user.count(),
  ]);

  return NextResponse.json({
    totalProyectos,
    totalTareas,
    tareasCompletadas,
    tareasPendientes: totalTareas - tareasCompletadas,
    totalUsuarios,
    progreso: totalTareas > 0 ? Math.round((tareasCompletadas / totalTareas) * 100) : 0,
  });
}