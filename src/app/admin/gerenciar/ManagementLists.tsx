// src/app/admin/gerenciar/ManagementLists.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ManagementListsProps {
  barbers: any[];
  services: any[];
}

export default function ManagementLists({ barbers, services }: ManagementListsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // --- ESTADOS PARA O MODAL DE CONFIRMAÇÃO ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'service' | 'barber', name: string } | null>(null);

  // Função para abrir o modal de confirmação
  const triggerDelete = (id: string, type: 'service' | 'barber', name: string) => {
    setItemToDelete({ id, type, name });
    setIsModalOpen(true);
  };

  // Função que executa a exclusão após o clique no modal
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    
    setIsLoading(true);
    const endpoint = itemToDelete.type === 'service' ? '/api/admin/services' : '/api/admin/barbers';
    
    try {
      const res = await fetch(`${endpoint}?id=${itemToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (res.ok) {
        setIsModalOpen(false);
        router.refresh();
      } else {
        alert(data.error || "Erro ao excluir.");
      }
    } catch (error) {
      alert("Erro de conexão.");
    } finally {
      setIsLoading(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 border-t border-zinc-800 pt-12">
      
      {/* SEÇÃO DE SERVIÇOS */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-yellow-500">✂️</span> Serviços Cadastrados
        </h2>
        <div className="space-y-3">
          {services?.map(service => (
            <div key={service.id} className="bg-[#111] border border-zinc-800 rounded-xl p-4 flex justify-between items-center hover:border-zinc-700 transition-colors">
              <div>
                <p className="font-bold text-white">{service.name}</p>
                <p className="text-xs text-zinc-500">{service.duration} min • R$ {Number(service.price).toFixed(2)}</p>
              </div>
              <button 
                onClick={() => triggerDelete(service.id, 'service', service.name)}
                className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SEÇÃO DE BARBEIROS */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-yellow-500">💈</span> Equipe
        </h2>
        <div className="space-y-3">
          {barbers?.map(barber => (
            <div key={barber.id} className="bg-[#111] border border-zinc-800 rounded-xl p-4 flex justify-between items-center hover:border-zinc-700 transition-colors">
              <div>
                <p className="font-bold text-white">{barber.user.name}</p>
                <p className="text-xs text-zinc-500">{barber.user.email}</p>
              </div>
              <button 
                onClick={() => triggerDelete(barber.id, 'barber', barber.user.name)}
                className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* --- NOSSO POPUP CUSTOMIZADO (MODAL) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
          
          <div className="bg-[#111] border border-zinc-800 rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="flex flex-col items-center text-center mb-6">
              <div className="bg-red-500/10 text-red-500 p-4 rounded-full mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Confirmar Exclusão</h3>
              <p className="text-zinc-400 mt-2">
                Tem certeza que deseja remover <strong>{itemToDelete?.name}</strong>? Esta ação não poderá ser desfeita.
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={isLoading}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 rounded-xl transition-colors border border-zinc-800"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmDelete}
                disabled={isLoading}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {isLoading ? "Excluindo..." : "Sim, excluir"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}