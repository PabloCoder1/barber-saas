'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientActionButtons({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // --- ESTADOS DO NOSSO MODAL CUSTOMIZADO ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'cancel' | 'reschedule' | null>(null);

  // Abre o modal dizendo qual é a ação
  const openModal = (type: 'cancel' | 'reschedule') => {
    setActionType(type);
    setIsModalOpen(true);
  };

  // Fecha o modal
  const closeModal = () => {
    setIsModalOpen(false);
    setActionType(null);
  };

  // Função disparada apenas quando o usuário clica em "SIM" dentro do nosso Modal
  const handleConfirmAction = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appointmentId, status: 'CANCELED' })
      });

      if (res.ok) {
        closeModal(); // Fecha o modal após o sucesso
        
        // Roteamento inteligente dependendo da ação escolhida
        if (actionType === 'reschedule') {
          router.push('/agendar'); 
        } else {
          router.refresh(); 
        }
      } else {
        alert("Erro ao processar a solicitação."); 
        setIsLoading(false);
      }
    } catch (error) {
      alert("Erro de conexão com o servidor.");
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* BOTÕES ORIGINAIS DO CARD */}
      <div className="flex gap-3 mt-4 justify-end">
        <button
          onClick={() => openModal('reschedule')}
          disabled={isLoading}
          className="text-sm font-bold text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          Reagendar
        </button>
        <button
          onClick={() => openModal('cancel')}
          disabled={isLoading}
          className="text-sm font-bold text-white bg-zinc-900 border border-zinc-800 hover:border-red-500/50 hover:text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>

      {/* --- NOSSO POPUP / MODAL CUSTOMIZADO --- */}
      {/* Ele só é renderizado na tela se a variável isModalOpen for TRUE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
          
          <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all">
            
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-full ${actionType === 'cancel' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                {/* Ícone Dinâmico: Xisão vermelho para cancelar, Calendário amarelo para reagendar */}
                {actionType === 'cancel' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                )}
              </div>
              <h3 className="text-xl font-bold text-white">
                {actionType === 'cancel' ? 'Cancelar Agendamento?' : 'Reagendar Horário?'}
              </h3>
            </div>
            
            <p className="text-zinc-400 mb-8 leading-relaxed">
              {actionType === 'cancel' 
                ? 'Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.' 
                : 'Para reagendar, nós vamos cancelar este horário e te levar para a tela de novos agendamentos. Deseja continuar?'}
            </p>

            <div className="flex justify-end gap-3">
              <button 
                onClick={closeModal}
                disabled={isLoading}
                className="px-5 py-2.5 text-sm font-bold text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
              >
                Voltar
              </button>
              <button 
                onClick={handleConfirmAction}
                disabled={isLoading}
                className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-colors flex items-center justify-center min-w-[120px] ${
                  actionType === 'cancel' 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-yellow-500 hover:bg-yellow-400 text-zinc-950'
                } disabled:opacity-50`}
              >
                {isLoading ? 'Aguarde...' : (actionType === 'cancel' ? 'Sim, cancelar' : 'Sim, reagendar')}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}