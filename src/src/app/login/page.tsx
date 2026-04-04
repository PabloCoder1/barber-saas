'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("E-mail ou senha incorretos.");
      setIsLoading(false);
    } else {
      router.push("/barber");
      router.refresh(); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 font-sans text-zinc-100">
      <div className="bg-[#111111] border border-zinc-800/50 p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center">
        
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => router.push('/')}>
          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
          </svg>
          <span className="text-2xl font-bold text-white tracking-tight">BarberPro</span>
        </div>

        {/* Títulos */}
        <div className="text-center mb-8 w-full">
          <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo de volta</h1>
          <p className="text-zinc-500 text-sm">Entre para gerenciar seus agendamentos</p>
        </div>

        {error && (
          <div className="w-full bg-red-950/50 border border-red-900/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 w-full">
          <div>
            <label className="block text-sm font-semibold text-zinc-100 mb-2">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-zinc-800 rounded-lg p-3.5 text-white placeholder-zinc-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all" 
              placeholder="seu@email.com" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-100 mb-2">Senha</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-zinc-800 rounded-lg p-3.5 text-white placeholder-zinc-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-bold py-3.5 rounded-lg transition-colors mt-2"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="w-full flex items-center gap-4 my-6">
          <div className="h-px bg-zinc-800 flex-1"></div>
          <span className="text-zinc-500 text-sm">ou</span>
          <div className="h-px bg-zinc-800 flex-1"></div>
        </div>

        <button 
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/meus-agendamentos' })}
          className="w-full bg-transparent border border-zinc-800 hover:bg-zinc-900 text-white font-semibold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-3 mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Entrar com Google
        </button>

        <p className="text-zinc-500 text-sm mb-4">
          Não tem uma conta? <a href="#" className="text-yellow-500 font-semibold hover:underline">Criar conta</a>
        </p>

        <button onClick={() => router.push('/')} className="text-zinc-500 text-sm font-semibold hover:text-white transition-colors">
          Voltar para a página inicial
        </button>
      </div>
    </div>
  );
}