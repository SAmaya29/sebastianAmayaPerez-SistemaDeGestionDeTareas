"use client";

import { useEffect, useState } from "react";

type Usuario = {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "USER";
    createdAt: string;
};

const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all";
const labelClass = "block text-sm font-semibold text-slate-300 mb-2";

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
    const [nuevoRol, setNuevoRol] = useState<"ADMIN" | "USER">("USER");
    const [nuevoNombre, setNuevoNombre] = useState("");
    const [nuevoEmail, setNuevoEmail] = useState("");
    const [saving, setSaving] = useState(false);
    const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
    const [busqueda, setBusqueda] = useState("");

    async function cargarUsuarios() {
        const res = await fetch("/api/usuarios");
        const data = await res.json();
        setUsuarios(data);
        setLoading(false);
    }

    useEffect(() => { cargarUsuarios(); }, []);

    function abrirEditar(usuario: Usuario) {
        setUsuarioEditando(usuario);
        setNuevoRol(usuario.role);
        setNuevoNombre(usuario.name);
        setNuevoEmail(usuario.email);
        setMensaje(null);
        setShowDialog(true);
    }

    async function handleGuardar() {
        if (!usuarioEditando) return;
        setSaving(true);
        setMensaje(null);
        const res = await fetch("/api/usuarios", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: usuarioEditando.id, role: nuevoRol, name: nuevoNombre, email: nuevoEmail }),
        });
        if (res.ok) {
            setMensaje({ tipo: "ok", texto: "Usuario actualizado exitosamente" });
            await cargarUsuarios();
            setTimeout(() => { setShowDialog(false); setMensaje(null); }, 1000);
        } else {
            setMensaje({ tipo: "error", texto: "Error al actualizar el usuario" });
        }
        setSaving(false);
    }

    const usuariosFiltrados = usuarios.filter(
        (u) =>
            u.name.toLowerCase().includes(busqueda.toLowerCase()) ||
            u.email.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <p className="text-slate-500 text-sm font-medium uppercase tracking-widest mb-1">Administración</p>
                <h2 className="text-3xl font-black text-white">Usuarios</h2>
                <p className="text-slate-500 text-sm mt-1">Gestiona los usuarios y sus roles</p>
            </div>

            {/* Búsqueda */}
            <div className="mb-5">
                <input
                    type="text"
                    placeholder="Buscar por nombre o correo..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
            </div>

            {/* Tabla de Usuarios */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm mb-6">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/10">
                            {["ID", "Nombre", "Correo Electrónico", "Rol", "Fecha de Registro", "Acciones"].map((h) => (
                                <th key={h} className="text-left px-6 py-4 text-slate-500 font-bold uppercase tracking-wider text-xs">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-slate-500">
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Cargando usuarios...
                                    </div>
                                </td>
                            </tr>
                        ) : usuariosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-slate-500">No se encontraron usuarios</td>
                            </tr>
                        ) : (
                            usuariosFiltrados.map((u, i) => (
                                <tr key={u.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-600">{u.id.slice(0, 8)}...</td>
                                    <td className="px-6 py-4 text-white font-medium">{u.name}</td>
                                    <td className="px-6 py-4 text-slate-300">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                            u.role === "ADMIN"
                                                ? "bg-purple-500/15 text-purple-400 border-purple-500/20"
                                                : "bg-blue-500/15 text-blue-400 border-blue-500/20"
                                        }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString("es-CO")}</td>
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => abrirEditar(u)} 
                                            className="text-emerald-400 hover:text-emerald-300 text-xs font-bold transition-colors"
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Dialog / Modal de Edición */}
            {showDialog && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-[#0d1220] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                        <h3 className="text-xl font-bold text-white mb-5">Editar Usuario</h3>
                        
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className={labelClass}>Nombre</label>
                                <input 
                                    type="text" 
                                    value={nuevoNombre} 
                                    onChange={(e) => setNuevoNombre(e.target.value)} 
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Correo Electrónico</label>
                                <input 
                                    type="email" 
                                    value={nuevoEmail} 
                                    onChange={(e) => setNuevoEmail(e.target.value)} 
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Rol de Usuario</label>
                                <select 
                                    value={nuevoRol} 
                                    onChange={(e) => setNuevoRol(e.target.value as "ADMIN" | "USER")} 
                                    className="w-full bg-[#0d1220] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                >
                                    <option value="USER">USER</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>
                        </div>

                        {mensaje && (
                            <div className={`mb-4 rounded-xl px-4 py-3 text-sm text-center font-semibold ${
                                mensaje.tipo === "ok"
                                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                    : "bg-red-500/10 border border-red-500/20 text-red-400"
                            }`}>
                                {mensaje.texto}
                            </div>
                        )}

                        <div className="flex gap-3 justify-end">
                            <button 
                                onClick={() => setShowDialog(false)}
                                disabled={saving}
                                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleGuardar}
                                disabled={saving}
                                className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 transition-all text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2"
                            >
                                {saving && (
                                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                )}
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}