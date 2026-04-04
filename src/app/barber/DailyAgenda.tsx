// src/app/barber/DailyAgenda.tsx
'use client';

import { useState } from 'react';
import ActionButtons from './ActionButtons';

export default function DailyAgenda({ groupedAppointments }: { groupedAppointments: Record<string, any[]> }) {
  const dates = Object.keys(groupedAppointments);
  const [selectedDate, setSelectedDate] = useState<string>(dates[0] || '');

  const dailyApps = groupedAppointments[selectedDate] || [];

  return (
    <div>
      {/* MENU DE ABAS SEMPRE VISÍVEL */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {dates.map(dateLabel => (
          <button
            key={dateLabel}
            onClick={() => setSelectedDate(dateLabel)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
              selectedDate === dateLabel
                ? 'bg-yellow-500 text-zinc-950 shadow-[0_0_15px_rgba(234,179,8,0.3)]' 
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700' 
            }`}
          >
            {dateLabel}
            {/* Um detalhe premium: Mostrar uma bolinha se tiver cliente naquele dia */}
            {groupedAppointments[dateLabel].length > 0 && selectedDate !== dateLabel && (
              <span className="ml-2 inline-block w-2 h-2 bg-yellow-500 rounded-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* SE O DIA ESTIVER VAZIO, MOSTRA ESTE AVISO APENAS NAQUELA ABA */}
      {dailyApps.length === 0 ? (
        <div className="bg-[#111111] border border-dashed border-zinc-800 rounded-2xl p-16 text-center text-zinc-500 mt-4">
          Nenhum agendamento para este dia. Aproveite o tempo livre! ☕
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dailyApps.map(app => (
            <div key={app.id} className="bg-[#111111] p-6 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col justify-between">
              
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-500/10 text-yellow-500 font-bold text-lg py-2 px-3 rounded-lg border border-yellow-500/20">
                    {app.startTimeStr}
                  </div>
                  <div>
                    <p className="font-bold text-white mb-1">{app.clientName}</p>
                    <p className="text-xs text-zinc-500">{app.clientPhone}</p>
                  </div>
                </div>
                <p className="font-bold text-white">R$ {app.totalPrice}</p>
              </div>

              <p className="text-sm text-zinc-400 mb-2">{app.serviceName}</p>

              {app.status === 'CONFIRMED' ? (
                <ActionButtons appointmentId={app.id} />
              ) : (
                <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-end">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                    app.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                    'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}>
                    {app.status === 'COMPLETED' ? '✅ Concluído' : app.status === 'NO_SHOW' ? '❌ Faltou' : '🚫 Cancelado'}
                  </span>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}