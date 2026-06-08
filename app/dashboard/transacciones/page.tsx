"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useSession } from "next-auth/react";

type Proyecto = { id: string; name: string };
type Usuario = { id: string; name: string; email: string };
type Tarea = {
    id: string;
    description: string;
    status: "PENDING" | "COMPLETED";
    createdAt: string;
    user: { id: string; name: string; email: string };
};

const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all";
const labelClass = "block text-sm font-semibold text-slate-300 mb-2";

export default function TransaccionesPage() {
    const { data: session } = useSession();
    const role = (session?.user as any)?.role;
    const userId = session?.user?.id;

    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [proyectoId, setProyectoId] = useState("");
    const [tareas, setTareas] = useState<Tarea[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loadingTareas, setLoadingTareas] = useState(false);
    const [filtro, setFiltro] = useState<"ALL" | "PENDING" | "COMPLETED">("ALL");

    // Crear Tarea States
    const [showCrear, setShowCrear] = useState(false);
    const [descripcion, setDescripcion] = useState("");
    const [nuevoStatus, setNuevoStatus] = useState<"PENDING" | "COMPLETED">("PENDING");
    const [asignadoA, setAsignadoA] = useState("");
    const [saving, setSaving] = useState(false);
    const [mensajeCrear, setMensajeCrear] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

    // Editar Tarea States
    const [showEditar, setShowEditar] = useState(false);
    const [tareaEditando, setTareaEditando] = useState<Tarea | null>(null);
    const [editStatus, setEditStatus] = useState<"PENDING" | "COMPLETED">("PENDING");
    const [editUserId, setEditUserId] = useState("");
    const [savingEditar, setSavingEditar] = useState(false);
    const [mensajeEditar, setMensajeEditar] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

    useEffect(() => {
        fetch("/api/proyectos").then((r) => r.json()).then((data) => {
            setProyectos(data);
            if (data.length > 0) setProyectoId(data[0].id);
        });
        if (role === "ADMIN") {
            fetch("/api/usuarios").then((r) => r.json()).then(setUsuarios);
        }
    }, [role]);

    useEffect(() => {
        if (!proyectoId) return;
        cargarTareas();
    }, [proyectoId]);

    async function cargarTareas() {
        setLoadingTareas(true);
        const res = await fetch(`/api/tareas?projectId=${proyectoId}`);
        const data = await res.json();
        setTareas(data);
        setLoadingTareas(false);
    }

    async function handleCrear() {
        if (!descripcion.trim()) return;
        setSaving(true);
        setMensajeCrear(null);
        const body: any = { description: descripcion, projectId: proyectoId, status: nuevoStatus };
        if (role === "ADMIN" && asignadoA) body.userId = asignadoA;
        const res = await fetch("/api/tareas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (res.ok) {
            setMensajeCrear({ tipo: "ok", texto: "Tarea creada exitosamente" });
            setDescripcion(""); setNuevoStatus("PENDING"); setAsignadoA("");
            await cargarTareas();
            setTimeout(() => { setShowCrear(false); setMensajeCrear(null); }, 1000);
        } else {
            setMensajeCrear({ tipo: "error", texto: "Error al crear la tarea" });
        }
        setSaving(false);
    }

    function abrirEditar(tarea: Tarea) {
        setTareaEditando(tarea);
        setEditStatus(tarea.status);
        setEditUserId(tarea.user?.id || "");
        setMensajeEditar(null);
        setShowEditar(true);
    }

    async function handleEditar() {
        if (!tareaEditando) return;
        setSavingEditar(true);
        setMensajeEditar(null);
        const body: any = { id: tareaEditando.id, status: editStatus };
        if (role === "ADMIN") body.userId = editUserId;

        const res = await fetch("/api/tareas", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            setMensajeEditar({ tipo: "ok", texto: "Tarea actualizada exitosamente" });
            await cargarTareas();
            setTimeout(() => { setShowEditar(false); setMensajeEditar(null); }, 1000);
        } else {
            const errorData = await res.json();
            setMensajeEditar({ tipo: "error", texto: errorData.error || "Error al actualizar la tarea" });
        }
        setSavingEditar(false);
    }

    async function handleEliminarTarea(id: string) {
        if (!confirm("¿Seguro que deseas eliminar esta tarea?")) return;
        await fetch("/api/tareas", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        await cargarTareas();
    }

    const proyectoActual = proyectos.find((p) => p.id === proyectoId);
    const tareasFiltradas = tareas.filter((t) => filtro === "ALL" || t.status === filtro);
    function puedeEditar(tarea: Tarea) { return role === "ADMIN" || tarea.user?.id === userId; }

    const graficaData = [...tareas]
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .reduce((acc: { fecha: string; total: number; completadas: number }[], tarea) => {
            const fecha = new Date(tarea.createdAt).toLocaleDateString("es-CO");
            const existing = acc.find((d) => d.fecha === fecha);
            if (existing) {
                existing.total += 1;
                if (tarea.status === "COMPLETED") existing.completadas += 1;
            } else {
                acc.push({ fecha, total: 1, completadas: tarea.status === "COMPLETED" ? 1 : 0 });
            }
            return acc;
        }, []);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="text-slate-500 text-sm font-medium uppercase tracking-widest mb-1">Gestión</p>
                    <h2 className="text-3xl font-black text-white">Transacciones</h2>
                    <p className="text-slate-500 text-sm mt-1">Gestiona las tareas por proyecto</p>
                </div>
                <button
                    onClick={() => { setShowCrear(true); setMensajeCrear(null); setDescripcion(""); }}
                    disabled={!proyectoId}
                    className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 transition-all duration-200 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5"
                >
                    + Agregar movimiento
                </button>
            </div>

            {/* Controles */}
            <div className="flex flex-wrap items-center gap-4 mb-5">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Proyecto</label>
                    <select
                        value={proyectoId}
                        onChange={(e) => setProyectoId(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    >
                        {proyectos.length === 0 && <option value="">Sin proyectos</option>}
                        {proyectos.map((p) => <option key={p.id} value={p.id} className="bg-[#0d1220]">{p.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Filtrar</label>
                    <div className="flex gap-1.5">
                        {(["ALL", "PENDING", "COMPLETED"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFiltro(f)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${filtro === f
                                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                                        : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10"
                                    }`}
                            >
                                {f === "ALL" ? "Todas" : f === "PENDING" ? "Pendientes" : "Completadas"}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm mb-6">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/10">
                            {["ID", "Descripción", "Tipo", "Cantidad", "Fecha", "Responsable", "Acciones"].map((h) => (
                                <th key={h} className="text-left px-6 py-4 text-slate-500 font-bold uppercase tracking-wider text-xs">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loadingTareas ? (
                            <tr>
                                <td colSpan={7} className="text-center py-12 text-slate-500">Cargando...</td>
                            </tr>
                        ) : tareasFiltradas.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-12 text-slate-500">No hay tareas para este proyecto</td>
                            </tr>
                        ) : (
                            tareasFiltradas.map((t, i) => (
                                <tr key={t.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-600">{t.id.slice(0, 8)}...</td>
                                    <td className="px-6 py-4 text-white font-medium max-w-xs truncate">{t.description}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${t.status === "COMPLETED" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-amber-500/15 text-amber-400 border-amber-500/20"
                                            }`}>
                                            {t.status === "COMPLETED" ? "Completada" : "Pendiente"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-center font-bold">1</td>
                                    <td className="px-6 py-4 text-slate-500 text-xs">{new Date(t.createdAt).toLocaleDateString("es-CO")}</td>
                                    <td className="px-6 py-4 text-slate-400 text-xs">{t.user?.name || "Sin asignar"}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-3">
                                            {puedeEditar(t) && (
                                                <button onClick={() => abrirEditar(t)} className="text-emerald-400 hover:text-emerald-300 text-xs font-bold transition-colors">
                                                    Editar
                                                </button>
                                            )}
                                            {role === "ADMIN" && (
                                                <button onClick={() => handleEliminarTarea(t.id)} className="text-red-400 hover:text-red-300 text-xs font-bold transition-colors">
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Gráfica */}
            {graficaData.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm mb-6">
                    <div className="mb-4">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Evolución</p>
                        <p className="text-white font-bold">{proyectoActual?.name || "Proyecto Seleccionado"}</p>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={graficaData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="fecha" stroke="#64748b" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#0d1220', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                                <Line type="monotone" dataKey="total" stroke="#64748b" name="Total" strokeWidth={2} />
                                <Line type="monotone" dataKey="completadas" stroke="#10b981" name="Completadas" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* MODAL DE EDICIÓN (ESTO ES LO QUE HACÍA FALTA REVISAR) */}
            {showEditar && tareaEditando && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-[#0d1220] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                        <h3 className="text-xl font-bold text-white mb-2">Editar Estado de Tarea</h3>
                        <p className="text-slate-400 text-xs truncate mb-5">Tarea: {tareaEditando.description}</p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className={labelClass}>Estado</label>
                                <select
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value as "PENDING" | "COMPLETED")}
                                    className="w-full bg-[#0d1220] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                >
                                    <option value="PENDING">Pendiente</option>
                                    <option value="COMPLETED">Completada</option>
                                </select>
                            </div>

                            {role === "ADMIN" && (
                                <div>
                                    <label className={labelClass}>Reasignar Responsable (Solo Admin)</label>
                                    <select
                                        value={editUserId}
                                        onChange={(e) => setEditUserId(e.target.value)}
                                        className="w-full bg-[#0d1220] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                    >
                                        <option value="">Selecciona un usuario</option>
                                        {usuarios.map((u) => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {mensajeEditar && (
                            <div className={`mb-4 rounded-xl px-4 py-3 text-sm text-center font-semibold ${mensajeEditar.tipo === "ok" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"
                                }`}>
                                {mensajeEditar.texto}
                            </div>
                        )}

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowEditar(false)}
                                disabled={savingEditar}
                                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleEditar}
                                disabled={savingEditar}
                                className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 transition-all text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2"
                            >
                                {savingEditar && <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />}
                                Actualizar Tarea
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE CREACIÓN (Para tener el flujo completo) */}
            {showCrear && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-[#0d1220] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-5">Agregar Nueva Tarea</h3>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className={labelClass}>Descripción</label>
                                <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className={inputClass} placeholder="Ej. Revisar balance de ingresos" />
                            </div>
                            <div>
                                <label className={labelClass}>Estado Inicial</label>
                                <select value={nuevoStatus} onChange={(e) => setNuevoStatus(e.target.value as "PENDING" | "COMPLETED")} className="w-full bg-[#0d1220] border border-white/10 rounded-xl px-4 py-3 text-sm text-white">
                                    <option value="PENDING">Pendiente</option>
                                    <option value="COMPLETED">Completada</option>
                                </select>
                            </div>
                            {role === "ADMIN" && (
                                <div>
                                    <label className={labelClass}>Asignar a</label>
                                    <select value={asignadoA} onChange={(e) => setAsignadoA(e.target.value)} className="w-full bg-[#0d1220] border border-white/10 rounded-xl px-4 py-3 text-sm text-white">
                                        <option value="">A mí mismo</option>
                                        {usuarios.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                        {mensajeCrear && (
                            <div className={`mb-4 rounded-xl px-4 py-3 text-sm text-center font-semibold ${mensajeCrear.tipo === "ok" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>{mensajeCrear.texto}</div>
                        )}
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowCrear(false)} className="px-4 py-2.5 text-slate-400 hover:text-white text-sm">Cancelar</button>
                            <button onClick={handleCrear} disabled={saving} className="bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg shadow-emerald-500/25">{saving ? "Guardando..." : "Crear Tarea"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}