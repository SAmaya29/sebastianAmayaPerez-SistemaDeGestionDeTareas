"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const links = [
    { href: "/dashboard", label: "Dashboard", icon: "⊞", roles: ["ADMIN", "USER"] },
    { href: "/dashboard/transacciones", label: "Transacciones", icon: "⇄", roles: ["ADMIN", "USER"] },
    { href: "/dashboard/maestros", label: "Proyectos", icon: "◫", roles: ["ADMIN", "USER"] },
    { href: "/dashboard/usuarios", label: "Usuarios", icon: "◎", roles: ["ADMIN"] },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const role = (session?.user as any)?.role;

    return (
        <aside className="w-64 min-h-screen bg-[#0a0f1e] border-r border-white/5 text-white flex flex-col">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-sm font-black">✓</div>
                    <span className="font-black text-lg tracking-tight">
                        Task <span className="text-emerald-400">Manager</span>
                    </span>
                </div>
            </div>

            {/* User info */}
            <div className="px-4 py-4 border-b border-white/5">
                <div className="flex items-center gap-3 px-2 py-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center font-black text-sm text-white flex-shrink-0 shadow-lg shadow-emerald-500/20">
                        {session?.user?.name?.charAt(0).toUpperCase() ?? "U"}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-white truncate">{session?.user?.name}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${role === "ADMIN"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-slate-500/20 text-slate-400"
                            }`}>
                            {role}
                        </span>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest px-3 mb-2">Menú</p>
                {links
                    .filter((l) => l.roles.includes(role))
                    .map((l) => {
                        const active = pathname === l.href;
                        return (
                            <Link
                                key={l.href}
                                href={l.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${active
                                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <span className={`text-base ${active ? "text-emerald-400" : "text-slate-500"}`}>
                                    {l.icon}
                                </span>
                                {l.label}
                                {active && <span className="ml-auto w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
                            </Link>
                        );
                    })}
            </nav>

            {/* Sign out */}
            <div className="px-3 py-4 border-t border-white/5">
                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
                >
                    <span>⏻</span>
                    Cerrar sesión
                </button>
            </div>
        </aside>
    );
}