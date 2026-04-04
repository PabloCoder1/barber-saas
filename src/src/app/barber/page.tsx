import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import DailyAgenda from "./DailyAgenda";
import LogoutButton from "@/components/LogoutButton";

export default async function BarberDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) redirect("/login");

  const myProfile = await prisma.barber.findFirst({
    where: { user: { email: session.user.email } },
    include: { user: true }
  });

  if (!myProfile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Acesso Negado</h1>
        <Link href="/" className="mt-6 text-yellow-500 hover:underline">Voltar ao início</Link>
      </div>
    );
  }

  // --- FUNÇÕES DE BLINDAGEM DE FUSO HORÁRIO ---
  const formatDateBR = (date: Date, options: Intl.DateTimeFormatOptions) => {
    return new Intl.DateTimeFormat('pt-BR', { ...options, timeZone: 'America/Sao_Paulo' }).format(date);
  };

  const getSafeDateCode = (date: Date) => {
    const d = formatDateBR(date, { day: '2-digit' });
    const m = formatDateBR(date, { month: '2-digit' });
    const y = formatDateBR(date, { year: 'numeric' });
    return `${y}-${m}-${d}`;
  };

  // --- CICLO DE COMISSÃO: sempre do dia 5 do mês atual ao dia 5 do próximo ---
  const now = new Date();
  const nowBRStr = now.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }); // YYYY-MM-DD
  const [nowYear, nowMonth, nowDay] = nowBRStr.split('-').map(Number);

  let cycleStart: Date;
  let cycleEnd: Date;

  if (nowDay >= 5) {
    // Estamos no dia 5 ou depois: ciclo começa no dia 5 deste mês
    cycleStart = new Date(`${nowYear}-${String(nowMonth).padStart(2,'0')}-05T00:00:00-03:00`);
    // Termina no dia 4 do próximo mês às 23:59
    const nextMonth = nowMonth === 12 ? 1 : nowMonth + 1;
    const nextYear = nowMonth === 12 ? nowYear + 1 : nowYear;
    cycleEnd = new Date(`${nextYear}-${String(nextMonth).padStart(2,'0')}-04T23:59:59-03:00`);
  } else {
    // Antes do dia 5: ciclo comeou no dia 5 do mês anterior
    const prevMonth = nowMonth === 1 ? 12 : nowMonth - 1;
    const prevYear = nowMonth === 1 ? nowYear - 1 : nowYear;
    cycleStart = new Date(`${prevYear}-${String(prevMonth).padStart(2,'0')}-05T00:00:00-03:00`);
    cycleEnd = new Date(`${nowYear}-${String(nowMonth).padStart(2,'0')}-04T23:59:59-03:00`);
  }

  // Formata as datas do ciclo para exibição
  const cycleStartLabel = cycleStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' });
  const cycleEndLabel = cycleEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' });

  // --- BUSCA COMISSÃO DO CICLO COMPLETO (passado + futuro confirmado, excluindo cancelados) ---
  const cycleAppointments = await prisma.appointment.findMany({
    where: {
      barberId: myProfile.id,
      status: { in: ['CONFIRMED', 'COMPLETED'] },
      startTime: { gte: cycleStart, lte: cycleEnd },
    },
  });

  const myCommission = cycleAppointments.reduce((acc, app) => {
    return acc + Number(app.totalPrice) * Number(myProfile.commissionRate);
  }, 0);

  // --- AGENDA: busca de HOJE em diante (sem ontem) ---
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const rawAppointments = await prisma.appointment.findMany({
    where: {
      barberId: myProfile.id,
      startTime: { gte: startOfToday },
    },
    include: { client: true, service: true },
    orderBy: { startTime: 'asc' }
  });

  const groupsByDateCode: Record<string, any[]> = {};

  rawAppointments.forEach(app => {
    const code = getSafeDateCode(app.startTime);
    if (!groupsByDateCode[code]) groupsByDateCode[code] = [];
    groupsByDateCode[code].push({
      id: app.id,
      status: app.status,
      totalPrice: Number(app.totalPrice).toFixed(2),
      startTimeStr: formatDateBR(app.startTime, { hour: '2-digit', minute: '2-digit' }),
      clientName: app.client.name,
      clientPhone: app.client.phone,
      serviceName: app.service.name
    });
  });

  const todayCode = getSafeDateCode(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowCode = getSafeDateCode(tomorrow);

  // Garante que hoje + próximos 6 dias apareçam mesmo vazios
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const code = getSafeDateCode(d);
    if (!groupsByDateCode[code]) groupsByDateCode[code] = [];
  }

  // Ordena e filtra apenas a partir de hoje (sem ontem)
  const sortedCodes = Object.keys(groupsByDateCode)
    .filter(code => code >= todayCode)
    .sort();

  const finalGroupedAppointments: Record<string, any[]> = {};

  sortedCodes.forEach(code => {
    const [y, m, d] = code.split('-');
    const dateObj = new Date(`${y}-${m}-${d}T12:00:00-03:00`);
    let weekday = formatDateBR(dateObj, { weekday: 'long' });
    weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    let label = `${weekday}, ${d}/${m}`;
    if (code === todayCode) label = `Hoje (${d}/${m})`;
    else if (code === tomorrowCode) label = `Amanhã (${d}/${m})`;
    finalGroupedAppointments[label] = groupsByDateCode[code];
  });

  const commissionPercent = Math.round(Number(myProfile.commissionRate) * 100);

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-zinc-100 font-sans pb-20">
      <nav className="max-w-4xl mx-auto flex justify-between items-center mb-12 border-b border-zinc-900 pb-6">
        <span className="text-xl font-bold text-white tracking-tight">
          BarberPro <span className="text-zinc-600 font-normal">| Profissional</span>
        </span>
        <LogoutButton />
      </nav>

      <div className="max-w-4xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-[#111111] border border-zinc-800 p-8 rounded-2xl shadow-lg">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Olá, {myProfile.user.name} ✂️</h1>
            <p className="text-zinc-400">Gerencie seus próximos atendimentos</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-sm text-zinc-500 mb-0.5">Comissão do Ciclo ({commissionPercent}%)</p>
            <p className="text-3xl font-bold text-yellow-500">R$ {myCommission.toFixed(2)}</p>
            <p className="text-xs text-zinc-600 mt-1">
              Período: {cycleStartLabel} → {cycleEndLabel}
            </p>
          </div>
        </header>

        <DailyAgenda groupedAppointments={finalGroupedAppointments} />
      </div>
    </div>
  );
}
