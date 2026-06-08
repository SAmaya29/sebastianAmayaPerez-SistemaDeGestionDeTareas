"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // En NextAuth v5, para que funcione bien en Vercel, cambiamos 'redirect: false'
            // por 'redirectTo', dejando que la librería controle el redireccionamiento seguro.
            const result = await signIn("credentials", {
                email,
                password,
                redirectTo: "/dashboard", // <- Le indicamos a dónde ir directamente
            });

            // Nota: Al usar redirección nativa, si los datos son correctos, 
            // NextAuth romperá el flujo aquí y moverá al usuario al /dashboard.

        } catch (err) {
            // Si entra al catch o el login falla, atrapamos el error para mostrarlo en pantalla
            setError("Correo o contraseña incorrectos");
            setLoading(false);
        }
    }
    return (
        <main className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4 relative overflow-hidden">
            {/* Fondo decorativo */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-white font-black text-2xl tracking-tight">
                        <span className="text-3xl">✅</span>
                        <span>Task <span className="text-emerald-400">Manager</span></span>
                    </Link>
                    <p className="text-slate-500 text-sm mt-2">Inicia sesión para continuar</p>
                </div>

                {/* Card */}
                <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                                placeholder="correo@ejemplo.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                <p className="text-red-400 text-sm text-center font-medium">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-white font-bold py-3 rounded-xl mt-1 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Ingresando...
                                </span>
                            ) : "Iniciar sesión"}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}