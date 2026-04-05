import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import AdminMobileNav from "@/components/AdminMobileNav";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) redirect("/login");

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  });
  if (currentUser?.role !== "OWNER") redirect("/barber");

  // --- DATAS ---
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // --- AGENDAMENTOS DE HOJE (realizados + confirmados) ---
  const todayAppointments = await prisma.appointment.findMany({
    where: {
      status: { in: ["CONFIRMED", "COMPLETED"] },
      startTime: { gte: startOfDay, lte: endOfDay },
    },
    include: {
      client: true,
      barber: { include: { user: true } },
      service: true,
    },
    orderBy: { startTime: 'asc' }
  });

  // --- TODOS OS AGENDAMENTOS FUTUROS CONFIRMADOS (inclui hoje) ---
  const allConfirmedAppointments = await prisma.appointment.findMany({
    where: {
      status: { in: ["CONFIRMED", "COMPLETED"] },
      startTime: { gte: startOfDay },
    },
    include: {
      barber: true,
    },
  });

  // --- MOTOR FINANCEIRO: HOJE ---
  let todayGross = 0;
  let todayOwner = 0;
  let todayCommission = 0;

  todayAppointments.forEach(app => {
    const price = Number(app.totalPrice);
    const cut = price * Number(app.barber.commissionRate);
    todayGross += price;
    todayCommission += cut;
    todayOwner += price - cut;
  });

  // --- MOTOR FINANCEIRO: PROJEÇÃO TOTAL ---
  let totalGross = 0;
  let totalOwner = 0;
  let totalCommission = 0;

  allConfirmedAppointments.forEach(app => {
    const price = Number(app.totalPrice);
    const cut = price * Number(app.barber.commissionRate);
    totalGross += price;
    totalCommission += cut;
    totalOwner += price - cut;
  });

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-zinc-100 font-sans pb-20">

      {/* NAVBAR */}
      <nav className="max-w-6xl mx-auto flex justify-between items-center mb-12 border-b border-zinc-900 pb-6">
        <div className="flex items-center gap-2">
          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
          </svg>
          <span className="text-xl font-bold text-white tracking-tight">BarberPro <span className="text-zinc-600 font-normal hidden sm:inline">| Gerencial</span></span>
        </div>
        {/* DESKTOP */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/" className="text-zinc-500 hover:text-white font-medium transition-colors text-sm">← Início</Link>
          <Link href="/admin/dashboard" className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">📊 Analytics</Link>
          <Link href="/admin/gerenciar" className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">⚙️ Gerenciar</Link>
          <LogoutButton />
        </div>
        {/* MOBILE */}
        <div className="flex md:hidden">
          <AdminMobileNav />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Visão Geral</h1>
            <p className="text-zinc-500">
              Desempenho de Hoje • {startOfDay.toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="bg-yellow-500/10 text-yellow-500 px-5 py-2.5 rounded-xl border border-yellow-500/20 font-bold">
            {todayAppointments.length} Atendimento{todayAppointments.length !== 1 ? 's' : ''} Hoje
          </div>
        </header>

        {/* === BLOCO: HOJE === */}
        <div className="mb-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
            Realizado hoje
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-[#111111] p-8 rounded-2xl border border-zinc-800 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-zinc-700"></div>
              <h3 className="text-zinc-400 font-medium mb-2 text-sm uppercase tracking-wider">Faturamento Bruto</h3>
              <p className="text-4xl font-bold text-white">R$ {todayGross.toFixed(2)}</p>
            </div>
            <div className="bg-zinc-900 p-8 rounded-2xl border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.05)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
              <h3 className="text-yellow-500/80 font-medium mb-2 text-sm uppercase tracking-wider">Líquido da Barbearia</h3>
              <p className="text-4xl font-bold text-yellow-500">R$ {todayOwner.toFixed(2)}</p>
            </div>
            <div className="bg-[#111111] p-8 rounded-2xl border border-zinc-800 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-zinc-700"></div>
              <h3 className="text-zinc-400 font-medium mb-2 text-sm uppercase tracking-wider">Comissões a Pagar</h3>
              <p className="text-4xl font-bold text-zinc-300">R$ {todayCommission.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* === BLOCO: PROJEÇÃO TOTAL === */}
        <div className="mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
            Projeção total (hoje + agendamentos futuros)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#111111] p-8 rounded-2xl border border-zinc-800/60 shadow-lg relative overflow-hidden opacity-80">
              <div className="absolute top-0 left-0 w-1 h-full bg-zinc-600"></div>
              <h3 className="text-zinc-500 font-medium mb-2 text-sm uppercase tracking-wider">Faturamento Projetado</h3>
              <p className="text-4xl font-bold text-zinc-400">R$ {totalGross.toFixed(2)}</p>
            </div>
            <div className="bg-[#111111] p-8 rounded-2xl border border-yellow-500/15 shadow-lg relative overflow-hidden opacity-80">
              <div className="absolute top-0 left-0 w-1 h-full bg-yellow-600/50"></div>
              <h3 className="text-yellow-600/80 font-medium mb-2 text-sm uppercase tracking-wider">Líquido Projetado</h3>
              <p className="text-4xl font-bold text-yellow-600">R$ {totalOwner.toFixed(2)}</p>
            </div>
            <div className="bg-[#111111] p-8 rounded-2xl border border-zinc-800/60 shadow-lg relative overflow-hidden opacity-80">
              <div className="absolute top-0 left-0 w-1 h-full bg-zinc-600"></div>
              <h3 className="text-zinc-500 font-medium mb-2 text-sm uppercase tracking-wider">Comissões Projetadas</h3>
              <p className="text-4xl font-bold text-zinc-500">R$ {totalCommission.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* TABELA DO DIA */}
        <h2 className="text-xl font-bold mb-6 text-white">Fluxo de Clientes</h2>
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          {todayAppointments.length === 0 ? (
            <div className="p-16 text-center text-zinc-500">
              <span className="text-4xl block mb-4">📭</span>
              Nenhum agendamento para hoje ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-zinc-900/50 border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-widest">
                    <th className="p-5 font-semibold">Horário</th>
                    <th className="p-5 font-semibold">Cliente</th>
                    <th className="p-5 font-semibold">Serviço</th>
                    <th className="p-5 font-semibold">Profissional</th>
                    <th className="p-5 font-semibold">Status</th>
                    <th className="p-5 font-semibold text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {todayAppointments.map(app => (
                    <tr key={app.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="p-5 font-bold text-yellow-500 w-24">
                        {app.startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-5">
                        <p className="font-bold text-zinc-200">{app.client.name}</p>
                        <p className="text-xs text-zinc-500 mt-1">{app.client.phone}</p>
                      </td>
                      <td className="p-5 text-zinc-400 text-sm">{app.service.name}</td>
                      <td className="p-5">
                        <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs font-medium border border-zinc-700">
                          {app.barber.user.name}
                        </span>
                      </td>
                      <td className="p-5">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          app.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                        }`}>
                          {app.status === 'COMPLETED' ? '✅ Concluído' : '🕐 Confirmado'}
                        </span>
                      </td>
                      <td className="p-5 font-bold text-white text-right">
                        R$ {Number(app.totalPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
