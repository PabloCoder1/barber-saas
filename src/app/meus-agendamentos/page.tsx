import prisma from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import ClientActionButtons from "./ClientActionButtons";
import LogoutButton from "@/components/LogoutButton";

export default async function MeusAgendamentos() {
  // 1. Busca a sessão do usuário logado
  const session = await getServerSession(authOptions);

  // 2. Se não estiver logado, redireciona para o login
  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const clientEmail = session.user.email; 

  const client = await prisma.user.findUnique({
    where: { email: clientEmail },
  });

  let appointments: any[] = [];

  // 3. Busca apenas os agendamentos DESTE usuário específico
  if (client) {
    appointments = await prisma.appointment.findMany({
      where: { clientId: client.id },
      include: {
        barber: { include: { user: true } },
        service: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  const now = new Date();
  const upcoming = appointments.filter(app => new Date(app.startTime) >= now && app.status !== "CANCELED");
  const past = appointments.filter(app => new Date(app.startTime) < now || app.status === "CANCELED");

  // Pega o primeiro nome para a saudação
  const firstName = session.user.name?.split(" ")[0] || "Cliente";

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 pb-20">
      
      {/* --- NAVBAR DO CLIENTE --- */}
      <nav className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center border-b border-zinc-900 mb-12">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
          </svg>
          <span className="text-2xl font-bold text-white tracking-tight">BarberPro</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/agendar" className="bg-yellow-500 hover:bg-yellow-400 text-zinc-950 px-5 py-2.5 rounded-lg font-bold transition-colors text-sm">
            Novo Agendamento
          </Link>
          <LogoutButton variant="outline" />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Olá, {firstName}</h1>
            <p className="text-zinc-500">Gerencie seus horários agendados</p>
          </div>
        </header>

        {/* --- PRÓXIMOS AGENDAMENTOS --- */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-white mb-6">Próximos Agendamentos</h2>
          
          {upcoming.length === 0 ? (
            <div className="p-8 border border-dashed border-zinc-800 rounded-2xl text-center text-zinc-500">
              Você não tem nenhum agendamento futuro.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcoming.map(app => (
                <div key={app.id} className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between hover:border-zinc-700 transition-colors">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{app.barber.user.name}</h3>
                        <p className="text-zinc-500 text-sm">{app.service.name}</p>
                      </div>
                      <span className="border border-yellow-500/30 text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full text-xs font-semibold">
                        Confirmado
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-8">
                      <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span>{app.startTime.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{app.startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-zinc-800/50">
                    <span className="text-lg font-bold text-yellow-500">R$ {Number(app.totalPrice).toFixed(2)}</span>
                    
                    {/* AQUI ESTÁ A MÁGICA: Substituímos a div antiga pelo nosso Client Component */}
                    <ClientActionButtons appointmentId={app.id} />
                    
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- HISTÓRICO --- */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6">Histórico</h2>
          
          {past.length === 0 ? (
            <div className="p-8 border border-dashed border-zinc-800 rounded-2xl text-center text-zinc-500">
              Nenhum histórico encontrado.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {past.map(app => (
                <div key={app.id} className="bg-[#0a0a0a] border border-zinc-800/50 rounded-2xl p-6 opacity-70 hover:opacity-100 transition-opacity">
                  <h3 className="text-lg font-bold text-white mb-1">{app.barber.user.name}</h3>
                  <p className="text-zinc-500 text-sm mb-4">{app.service.name}</p>
                  
                  <div className="space-y-1 mb-6">
                    <div className="flex items-center gap-2 text-zinc-500 text-xs">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span>{app.startTime.toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500 text-xs">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span>{app.startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-800/50 flex justify-between items-center">
                    <span className="font-bold text-white text-sm">R$ {Number(app.totalPrice).toFixed(2)}</span>
                    <span className={`text-xs font-bold ${app.status === 'CANCELED' ? 'text-red-500' : 'text-emerald-500'}`}>
                      {app.status === 'CANCELED' ? 'Cancelado' : 'Concluído'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}