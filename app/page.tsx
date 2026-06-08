import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center text-white px-4 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-emerald-900/20 blur-3xl" />
      </div>

      {/* Grid decorativo */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative text-center max-w-2xl">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-wider uppercase">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Sistema de Gestión de Tareas
        </div>

        <h1 className="text-6xl md:text-7xl font-black mb-6 leading-none tracking-tight">
          Task
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Manager
          </span>
        </h1>

        <p className="text-slate-400 text-lg mb-12 leading-relaxed max-w-lg mx-auto">
          Organiza proyectos, asigna tareas y haz seguimiento del progreso de tu equipo — todo en un solo lugar.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="bg-emerald-500 hover:bg-emerald-400 transition-all duration-200 text-white font-bold px-8 py-3.5 rounded-xl text-base shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
          >
            Iniciar sesión →
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-16">
          {[
            { icon: "📁", label: "Proyectos" },
            { icon: "✅", label: "Tareas" },
            { icon: "👥", label: "Equipos" },
          ].map((f) => (
            <div key={f.label} className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-2xl mb-1">{f.icon}</div>
              <div className="text-xs text-slate-400 font-medium">{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}