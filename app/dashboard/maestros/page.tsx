"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Proyecto = {
  id: string;
  name: string;
  createdAt: string;
  createdBy: { name: string; email: string };
  _count: { tasks: number };
  tasks: { status: string }[];
};

export default function MaestrosPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [nombre, setNombre] = useState("");
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  async function cargarProyectos() {
    const res = await fetch("/api/proyectos");
    const data = await res.json();
    setProyectos(data);
    setLoading(false);
  }

  useEffect(() => { cargarProyectos(); }, []);

  async function handleCrear() {
    if (!nombre.trim()) return;
    setSaving(true);
    setMensaje(null);
    const res = await fetch("/api/proyectos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nombre }),
    });
    if (res.ok) {
      setMensaje({ tipo: "ok", texto: "Proyecto creado exitosamente" });
      setNombre("");
      await cargarProyectos();
      setTimeout(() => { setShowDialog(false); setMensaje(null); }, 1000);
    } else {
      setMensaje({ tipo: "error", texto: "Error al crear el proyecto" });
    }
    setSaving(false);
  }

  async function handleEliminarProyecto(id: string) {
    if (!confirm("¿Seguro? Esto eliminará el proyecto y todas sus tareas.")) return;
    await fetch("/api/proyectos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await cargarProyectos();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest mb-1">Maestros</p>
          <h2 className="text-3xl font-black text-white">Proyectos</h2>
          <p className="text-slate-500 text-sm mt-1">Gestiona los proyectos del sistema</p>
        </div>
        {role === "ADMIN" && (
          <button
            onClick={() => { setShowDialog(true); setMensaje(null); setNombre(""); }}
            className="bg-emerald-500 hover:bg-emerald-400 transition-all duration-200 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5"
          >
            + Agregar proyecto
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-4 text-slate-500 font-bold uppercase tracking-wider text-xs">ID</th>
              <th className="text-left px-6 py-4 text-slate-500 font-bold uppercase tracking-wider text-xs">Nombre</th>
              <th className="text-left px-6 py-4 text-slate-500 font-bold uppercase tracking-wider text-xs">Saldo</th>
              <th className="text-left px-6 py-4 text-slate-500 font-bold uppercase tracking-wider text-xs">Progreso</th>
              <th className="text-left px-6 py-4 text-slate-500 font-bold uppercase tracking-wider text-xs">Creado por</th>
              <th className="text-left px-6 py-4 text-slate-500 font-bold uppercase tracking-wider text-xs">Fecha</th>
              {role === "ADMIN" && (
                <th className="text-left px-6 py-4 text-slate-500 font-bold uppercase tracking-wider text-xs">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Cargando...
                  </div>
                </td>
              </tr>
            ) : proyectos.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500">
                  No hay proyectos aún
                </td>
              </tr>
            ) : (
              proyectos.map((p, i) => {
                const total = p._count.tasks;
                const completadas = p.tasks.filter((t) => t.status === "COMPLETED").length;
                const pct = total > 0 ? Math.round((completadas / total) * 100) : 0;
                return (
                  <tr
                    key={p.id}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}
                  >
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">{p.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4 font-bold text-white">{p.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-xs font-bold">
                        {p._count.tasks} tareas
                      </span>
                    </td>
                    <td className="px-6 py-4 min-w-40">
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-slate-500">{completadas}/{total}</span>
                        <span className={pct === 100 ? "text-emerald-400" : "text-amber-400"}>{pct}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-1.5 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{p.createdBy.name}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{new Date(p.createdAt).toLocaleDateString("es-CO")}</td>
                    {role === "ADMIN" && (
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleEliminarProyecto(p.id)}
                          className="text-red-400 hover:text-red-300 text-xs font-bold transition-colors hover:underline"
                        >
                          Eliminar
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1220] border border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-black text-white mb-1">Nuevo proyecto</h3>
            <p className="text-slate-500 text-sm mb-6">Crea un nuevo proyecto en el sistema</p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Nombre del proyecto</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  placeholder="Ej: Rediseño web"
                />
              </div>

              {mensaje && (
                <div className={`rounded-xl px-4 py-3 text-sm text-center font-semibold ${
                  mensaje.tipo === "ok"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : "bg-red-500/10 border border-red-500/20 text-red-400"
                }`}>
                  {mensaje.texto}
                </div>
              )}

              <div className="flex gap-3 justify-end mt-2">
                <button
                  onClick={() => { setShowDialog(false); setMensaje(null); }}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCrear}
                  disabled={saving}
                  className="px-5 py-2.5 text-sm bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Creando...
                    </span>
                  ) : "Crear proyecto"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}