'use client';

import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

type PeriodKey = '7d' | '30d' | 'month';

interface DayData {
  date: string;
  faturamento: number;
  atendimentos: number;
}

interface BarberStat {
  name: string;
  atendimentos: number;
  faturamento: number;
  comissao: number;
  avgRating: number;
  totalReviews: number;
}

interface DashboardChartsProps {
  data7d: DayData[];
  data30d: DayData[];
  dataMonth: DayData[];
  barberStats: BarberStat[];
}

const PERIOD_LABELS: Record<PeriodKey, string> = {
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
  'month': 'Mês atual',
};

function StarRating({ rating, total }: { rating: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map(s => (
          <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'text-yellow-400' : 'text-zinc-700'}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <span className="text-xs text-zinc-400">
        {total > 0 ? `${rating.toFixed(1)} (${total})` : 'Sem avaliações'}
      </span>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] border border-zinc-700 rounded-xl p-3 shadow-xl text-sm">
        <p className="text-zinc-400 mb-2 font-medium">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="font-bold">
            {p.name === 'faturamento' ? `R$ ${Number(p.value).toFixed(2)}` : `${p.value} atend.`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardCharts({ data7d, data30d, dataMonth, barberStats }: DashboardChartsProps) {
  const [period, setPeriod] = useState<PeriodKey>('7d');

  const dataMap: Record<PeriodKey, DayData[]> = { '7d': data7d, '30d': data30d, month: dataMonth };
  const chartData = dataMap[period];

  const totalFaturamento = chartData.reduce((a, d) => a + d.faturamento, 0);
  const totalAtendimentos = chartData.reduce((a, d) => a + d.atendimentos, 0);
  const avgPerDay = chartData.length > 0 ? totalFaturamento / chartData.filter(d => d.faturamento > 0).length || 0 : 0;

  return (
    <div className="space-y-8">

      {/* SELETOR DE PERÍODO */}
      <div className="flex items-center gap-2">
        {(Object.keys(PERIOD_LABELS) as PeriodKey[]).map(key => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              period === key
                ? 'bg-yellow-500 text-zinc-950'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            {PERIOD_LABELS[key]}
          </button>
        ))}
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Faturamento no Período</p>
          <p className="text-3xl font-bold text-white">R$ {totalFaturamento.toFixed(2)}</p>
        </div>
        <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Total de Atendimentos</p>
          <p className="text-3xl font-bold text-white">{totalAtendimentos}</p>
        </div>
        <div className="bg-[#111] border border-yellow-500/20 rounded-2xl p-6">
          <p className="text-yellow-500/70 text-xs uppercase tracking-wider mb-2">Ticket Médio por Dia Ativo</p>
          <p className="text-3xl font-bold text-yellow-500">R$ {isFinite(avgPerDay) ? avgPerDay.toFixed(2) : '0.00'}</p>
        </div>
      </div>

      {/* GRÁFICO DE FATURAMENTO */}
      <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-6">Faturamento — {PERIOD_LABELS[period]}</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `R$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="faturamento" stroke="#eab308" strokeWidth={2} fill="url(#goldGrad)" dot={false} activeDot={{ r: 5, fill: '#eab308' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* GRÁFICO DE ATENDIMENTOS */}
      <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-6">Atendimentos — {PERIOD_LABELS[period]}</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="atendimentos" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.atendimentos > 0 ? '#eab308' : '#27272a'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* RANKING DE BARBEIROS */}
      <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-6">🏆 Ranking da Equipe</h3>
        {barberStats.length === 0 ? (
          <p className="text-zinc-500 text-sm">Nenhum dado disponível.</p>
        ) : (
          <div className="space-y-4">
            {barberStats.map((barber, i) => (
              <div key={barber.name} className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                  i === 0 ? 'bg-yellow-500 text-zinc-950' :
                  i === 1 ? 'bg-zinc-400 text-zinc-950' :
                  i === 2 ? 'bg-amber-700 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{barber.name}</p>
                  <StarRating rating={barber.avgRating} total={barber.totalReviews} />
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-white text-sm">{barber.atendimentos} atend.</p>
                  <p className="text-xs text-zinc-500">R$ {barber.faturamento.toFixed(2)}</p>
                </div>
                <div className="text-right flex-shrink-0 hidden md:block">
                  <p className="text-yellow-500 font-bold text-sm">R$ {barber.comissao.toFixed(2)}</p>
                  <p className="text-xs text-zinc-500">comissão</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
