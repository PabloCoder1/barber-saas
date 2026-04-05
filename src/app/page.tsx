import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import ThemeToggle from "@/components/ThemeToggle";
import MobileNav from "@/components/MobileNav";

export default async function Home() {
  const session = await getServerSession(authOptions);

  let painelLink = "/meus-agendamentos";
  let painelNome = "Meu Painel";

  if (session?.user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });
    if (dbUser?.role === "OWNER") { painelLink = "/admin"; painelNome = "Painel Gerencial"; }
    else if (dbUser?.role === "BARBER") { painelLink = "/barber"; painelNome = "Painel do Profissional"; }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-200">

      {/* NAVBAR */}
      <nav className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center border-b border-zinc-200 dark:border-zinc-900/50">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
          </svg>
          <span className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">BarberPro</span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {session ? (
            <>
              <span className="text-zinc-500 dark:text-zinc-400 text-sm">
                Olá, <strong className="text-zinc-900 dark:text-white">{session.user?.name?.split(" ")[0]}</strong>
              </span>
              <Link href={painelLink} className="text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:text-yellow-500 transition-colors">
                {painelNome}
              </Link>
              <Link href="/agendar" className="bg-yellow-500 hover:bg-yellow-400 text-zinc-950 px-5 py-2.5 rounded-lg font-bold transition-colors text-sm">
                Novo Agendamento
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-medium transition-colors text-sm">
                Entrar
              </Link>
              <Link href="/agendar" className="bg-yellow-500 hover:bg-yellow-400 text-zinc-950 px-5 py-2.5 rounded-lg font-bold transition-colors text-sm">
                Agendar Horário
              </Link>
            </>
          )}
        </div>

        {/* MOBILE NAV — hamburguer */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <MobileNav
            isLoggedIn={!!session}
            painelLink={painelLink}
            painelNome={painelNome}
            userName={session?.user?.name?.split(" ")[0] || ""}
          />
        </div>
      </nav>

      {/* HERO */}
      <main className="max-w-5xl mx-auto px-6 py-28 md:py-36 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-7xl font-extrabold text-zinc-900 dark:text-white mb-6 tracking-tight leading-tight">
          Agende seu corte com os <br className="hidden md:block" /> melhores barbeiros
        </h1>
        <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 mb-12 max-w-2xl font-light">
          Sistema moderno e profissional para agendamento online. Rápido, fácil e sem complicação.
        </p>
        <Link href="/agendar" className="bg-yellow-500 hover:bg-yellow-400 text-zinc-950 px-8 py-4 rounded-xl font-bold text-lg transition-transform hover:scale-105 shadow-[0_0_40px_-10px_rgba(234,179,8,0.3)]">
          Agendar Agora
        </Link>
      </main>

      {/* COMO FUNCIONA */}
      <section className="bg-zinc-100 dark:bg-[#0a0a0a] py-24 border-y border-zinc-200 dark:border-zinc-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-zinc-900 dark:text-white mb-16">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[
              { n: '1', title: 'Escolha o barbeiro', desc: 'Selecione seu barbeiro favorito' },
              { n: '2', title: 'Escolha o serviço', desc: 'Corte, barba ou combo' },
              { n: '3', title: 'Confirme o horário', desc: 'Pronto! Seu horário está garantido' },
            ].map(step => (
              <div key={step.n} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 flex items-center justify-center text-2xl font-bold mb-6">
                  {step.n}
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POR QUE ESCOLHER */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-zinc-900 dark:text-white mb-16">Por que escolher a BarberPro?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Economia de tempo', desc: 'Agende de qualquer lugar, sem filas' },
            { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Confirmação instantânea', desc: 'Receba confirmação na hora' },
            { icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', title: 'Melhores profissionais', desc: 'Barbeiros experientes e qualificados' },
            { icon: 'M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z', title: 'Variedade de serviços', desc: 'Cortes modernos e clássicos' },
          ].map(card => (
            <div key={card.title} className="bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 hover:border-yellow-500/30 transition-colors">
              <svg className="w-8 h-8 text-yellow-500 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
              </svg>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{card.title}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-yellow-500 py-24 text-center px-6">
        <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-950 mb-6 tracking-tight">Pronto para transformar seu visual?</h2>
        <p className="text-zinc-800 font-medium text-lg mb-10 max-w-2xl mx-auto">
          Agende agora e garanta seu horário com os melhores barbeiros
        </p>
        <Link href="/agendar" className="inline-block bg-zinc-950 hover:bg-zinc-900 text-white px-10 py-4 rounded-xl font-bold text-lg transition-transform hover:scale-105 shadow-xl">
          Fazer Agendamento
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-200 dark:border-zinc-900 py-10 text-center text-zinc-500 text-sm">
        <p>© {new Date().getFullYear()} BarberPro. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
