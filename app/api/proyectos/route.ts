import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - obtener todos los proyectos
export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const proyectos = await prisma.project.findMany({
        include: {
            createdBy: { select: { name: true, email: true } },
            _count: { select: { tasks: true } },
            tasks: { select: { status: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(proyectos);
}

// POST - crear nuevo proyecto
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if ((session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    if (!session.user?.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { name, initialBalance } = await req.json();
    if (!name) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

    const proyecto = await prisma.project.create({
        data: { name, createdById: session.user.id! },
        include: {
            createdBy: { select: { name: true, email: true } },
            _count: { select: { tasks: true } },
            tasks: { select: { status: true } },
        },
    });

    return NextResponse.json(proyecto);
}