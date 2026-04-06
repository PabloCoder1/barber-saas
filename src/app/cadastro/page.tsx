// src/app/cadastro/page.tsx
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CadastroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Se deu certo, manda o cara para o login para ele entrar
        router.push("/login?registered=true");
      } else {
        setError(data.error || "Erro ao criar conta.");
      }
    } catch (err) {
      setError("Erro de conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111111] p-8 rounded-2xl border border-zinc-800 shadow-2xl">
        
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-2">
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
            </svg>
            <h1 className="text-2xl font-bold text-white tracking-tight">BarberPro</h1>
          </div>
          <h2 className="text-xl font-semibold text-white mt-4">Crie sua conta</h2>
          <p className="text-zinc-500 text-sm mt-1">Cadastre-se para agendar seus horários</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm text-center mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Nome completo</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-yellow-500 transition-colors"
              placeholder="João Silva"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">E-mail</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-yellow-500 transition-colors"
              placeholder="joao@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Senha</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-yellow-500 transition-colors"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold py-3 rounded-xl transition-colors mt-6 disabled:opacity-50"
          >
            {isLoading ? "Criando conta..." : "Cadastrar"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-zinc-500">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors">
            Fazer login
          </Link>
        </div>

      </div>
    </div>
  );
}