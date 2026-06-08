"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Stats = {
    totalProyectos: number;
    totalTareas: number;
    tareasCompletadas: number;
    tareasPendientes: number;
    totalUsuarios: number;
    progreso: number;
};

export default function DashboardPage() {
    const { data: session } = useSession();
    const role = (session?.user as any)?.role;
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        fetch("/api/stats").then((r) => r.json()).then(setStats);
    }, []);

    const cards = [
        {
            label: "Proyectos",
            value: stats?.totalProyectos ?? "—",
            icon: "◫",
            gradient: "from-emerald-500/20 to-emerald-500/5",
            border: "border-emerald-500/20",
            text: "text-emerald-400",
        },
        {
            label: "Tareas totales",
            value: stats?.totalTareas ?? "—",
            icon: "⊞",
            gradient: "from-cyan-500/20 to-cyan-500/5",
            border: "border-cyan-500/20",
            text: "text-cyan-400",
        },
        {
            label: "Completadas",
            value: stats?.tareasCompletadas ?? "—",
            icon: "✓",
            gradient: "from-green-500/20 to-green-500/5",
            border: "border-green-500/20",
            text: "text-green-400",
        },
        {
            label: "Pendientes",
            value: stats?.tareasPendientes ?? "—",
            icon: "◷",
            gradient: "from-amber-500/20 to-amber-500/5",
            border: "border-amber-500/20",
            text: "text-amber-400",
        },
        ...(role === "ADMIN"
            ? [{
                label: "Usuarios",
                value: stats?.totalUsuarios ?? "—",
                icon: "◎",
                gradient: "from-purple-500/20 to-purple-500/5",
                border: "border-purple-500/20",
                text: "text-purple-400",
            }]
            : []),
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <p className="text-slate-500 text-sm font-medium uppercase tracking-widest mb-1">Panel principal</p>
                <h2 className="text-3xl font-black text-white">
                    Hola, {session?.user?.name?.split(" ")[0]} 👋
                </h2>
                <p className="text-slate-500 text-sm mt-1">Aquí tienes un resumen del sistema</p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {cards.map((c) => (
                    <div
                        key={c.label}
                        className={`bg-gradient-to-br ${c.gradient} border ${c.border} rounded-2xl p-5 backdrop-blur-sm`}
                    >
                        <div className={`text-2xl font-black mb-3 ${c.text}`}>{c.icon}</div>
                        <div className={`text-4xl font-black ${c.text} mb-1`}>{c.value}</div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{c.label}</div>
                    </div>
                ))}
            </div>

            {/* Progreso general */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Progreso general</p>
                        <p className="text-white font-bold text-lg">Completación del sistema</p>
                    </div>
                    <div className="text-right">
                        <span className="text-4xl font-black text-emerald-400">{stats?.progreso ?? 0}</span>
                        <span className="text-emerald-400 font-bold text-xl">%</span>
                    </div>
                </div>

                <div className="w-full bg-white/5 rounded-full h-3 mb-3 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${stats?.progreso ?? 0}%` }}
                    />
                </div>

                <div className="flex justify-between text-xs font-semibold">
                    <span className="text-emerald-400">{stats?.tareasCompletadas ?? 0} completadas</span>
                    <span className="text-amber-400">{stats?.tareasPendientes ?? 0} pendientes</span>
                </div>
            </div>
        </div>
    );
}