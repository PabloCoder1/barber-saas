import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import DashboardCharts from "./DashboardCharts";
import AdminMobileNav from "@/components/AdminMobileNav";

function buildDayRange(startDate: Date, days: number) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' });
  });
}

async function getChartData(from: Date, to: Date, totalDays: number) {
  const appointments = await prisma.appointment.findMany({
    where: {
      status: { in: ['CONFIRMED', 'COMPLETED'] },
      startTime: { gte: from, lte: to },
    },
    select: { startTime: true, totalPrice: true },
  });

  const map: Record<string, { faturamento: number; atendimentos: number }> = {};
  appointments.forEach(app => {
    const key = app.startTime.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' });
    if (!map[key]) map[key] = { faturamento: 0, atendimentos: 0 };
    map[key].faturamento += Number(app.totalPrice);
    map[key].atendimentos += 1;
  });

  const days = buildDayRange(from, totalDays);
  return days.map(date => ({
    date,
    faturamento: map[date]?.faturamento ?? 0,
    atendimentos: map[date]?.atendimentos ?? 0,
  }));
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (currentUser?.role !== "OWNER") redirect("/barber");

  const now = new Date();

  // --- Períodos ---
  const start7d = new Date(now); start7d.setDate(now.getDate() - 6); start7d.setHours(0,0,0,0);
  const start30d = new Date(now); start30d.setDate(now.getDate() - 29); start30d.setHours(0,0,0,0);
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const endOfDay = new Date(now); endOfDay.setHours(23,59,59,999);

  const [data7d, data30d, dataMonth] = await Promise.all([
    getChartData(start7d, endOfDay, 7),
    getChartData(start30d, endOfDay, 30),
    getChartData(startMonth, endOfDay, daysInMonth),
  ]);

  // --- Ranking de barbeiros com avaliações reais ---
  const barbers = await prisma.barber.findMany({
    include: {
      user: true,
      appointments: {
        where: { status: { in: ['CONFIRMED', 'COMPLETED'] } },
        select: { totalPrice: true, status: true },
      },
      reviews: {
        select: { rating: true },
      },
    },
  });

  const barberStats = barbers
    .map(b => {
      const atendimentos = b.appointments.filter(a => a.status === 'COMPLETED').length;
      const faturamento = b.appointments.reduce((acc, a) => acc + Number(a.totalPrice), 0);
      const comissao = faturamento * Number(b.commissionRate);
      const totalReviews = b.reviews.length;
      const avgRating = totalReviews > 0
        ? b.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
        : 0;
      return { name: b.user.name, atendimentos, faturamento, comissao, avgRating, totalReviews };
    })
    .sort((a, b) => b.atendimentos - a.atendimentos);

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-zinc-100 font-sans pb-20">
      <nav className="max-w-6xl mx-auto flex justify-between items-center mb-12 border-b border-zinc-900 pb-6">
        <div className="flex items-center gap-2">
          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
          </svg>
          <span className="text-xl font-bold text-white tracking-tight">BarberPro <span className="text-zinc-600 font-normal hidden sm:inline">| Dashboard</span></span>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link href="/admin" className="text-sm text-zinc-400 hover:text-white transition-colors">← Visão Geral</Link>
          <Link href="/admin/gerenciar" className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">⚙️ Gerenciar</Link>
          <LogoutButton />
        </div>
        <div className="flex md:hidden">
          <AdminMobileNav />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-1">Analytics</h1>
          <p className="text-zinc-500">Performance da barbearia em detalhes</p>
        </header>

        <DashboardCharts
          data7d={data7d}
          data30d={data30d}
          dataMonth={dataMonth}
          barberStats={barberStats}
        />
      </div>
    </div>
  );
}
