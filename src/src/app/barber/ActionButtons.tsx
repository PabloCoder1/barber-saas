// src/app/barber/ActionButtons.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ActionType = 'COMPLETED' | 'NO_SHOW' | 'CANCELED';

const MODAL_CONFIG: Record<ActionType, { label: string; description: string; btnClass: string; icon: string }> = {
  COMPLETED: {
    label: 'Confirmar atendimento?',
    description: 'Isso vai marcar o cliente como atendido.',
    btnClass: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    icon: '✅',
  },
  NO_SHOW: {
    label: 'Marcar como faltou?',
    description: 'O cliente não apareceu para o atendimento.',
    btnClass: 'bg-zinc-700 hover:bg-zinc-600 text-white',
    icon: '❌',
  },
  CANCELED: {
    label: 'Cancelar agendamento?',
    description: 'O agendamento será cancelado e removido da comissão.',
    btnClass: 'bg-red-600 hover:bg-red-500 text-white',
    icon: '🚫',
  },
};

export default function ActionButtons({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<ActionType | null>(null);

  const openModal = (action: ActionType) => setPendingAction(action);
  const closeModal = () => setPendingAction(null);

  const handleConfirm = async () => {
    if (!pendingAction) return;
    setIsLoading(true);
    try {
      await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appointmentId, status: pendingAction }),
      });
      closeModal();
      router.refresh();
    } catch {
      alert('Erro ao atualizar o status.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* BOTÕES — grid de 3 colunas, toque fácil no mobile */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-zinc-800">
        <button
          disabled={isLoading}
          onClick={() => openModal('COMPLETED')}
          className="flex flex-col items-center justify-center gap-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 active:scale-95 py-3 rounded-xl border border-emerald-500/20 font-semibold transition-all disabled:opacity-50"
        >
          <span className="text-xl">✅</span>
          <span className="text-xs">Atendido</span>
        </button>
        <button
          disabled={isLoading}
          onClick={() => openModal('NO_SHOW')}
          className="flex flex-col items-center justify-center gap-1.5 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 active:scale-95 py-3 rounded-xl border border-zinc-700 font-semibold transition-all disabled:opacity-50"
        >
          <span className="text-xl">❌</span>
          <span className="text-xs">Faltou</span>
        </button>
        <button
          disabled={isLoading}
          onClick={() => openModal('CANCELED')}
          className="flex flex-col items-center justify-center gap-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-95 py-3 rounded-xl border border-red-500/20 font-semibold transition-all disabled:opacity-50"
        >
          <span className="text-xl">🚫</span>
          <span className="text-xs">Cancelar</span>
        </button>
      </div>

      {/* MODAL DE CONFIRMAÇÃO */}
      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-zinc-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-6">
              <span className="text-5xl block mb-4">{MODAL_CONFIG[pendingAction].icon}</span>
              <h3 className="text-xl font-bold text-white mb-2">
                {MODAL_CONFIG[pendingAction].label}
              </h3>
              <p className="text-zinc-400 text-sm">{MODAL_CONFIG[pendingAction].description}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                disabled={isLoading}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 rounded-xl transition-colors border border-zinc-800 disabled:opacity-50"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`flex-1 font-bold py-3 rounded-xl transition-colors disabled:opacity-50 ${MODAL_CONFIG[pendingAction].btnClass}`}
              >
                {isLoading ? 'Aguarde...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
