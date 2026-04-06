// src/app/admin/gerenciar/ManagementForms.tsx
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ManagementForms() {
  const router = useRouter();

  // --- ESTADOS DO SERVIÇO ---
  const [serviceName, setServiceName] = useState("");
  const [serviceDuration, setServiceDuration] = useState("");
  const [servicePrice, setServicePrice] = useState("");

  // --- ESTADOS DO BARBEIRO ---
  const [barberName, setBarberName] = useState("");
  const [barberEmail, setBarberEmail] = useState("");
  const [barberPhone, setBarberPhone] = useState("");
  const [barberPassword, setBarberPassword] = useState("");
  const [barberCommission, setBarberCommission] = useState("");
  const [barberOffDay, setBarberOffDay] = useState("1");

  // FUNÇÃO: ADICIONAR SERVIÇO
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: serviceName,
        duration: serviceDuration,
        price: servicePrice
      })
    });

    if (res.ok) {
      toast.success("Serviço adicionado com sucesso!");
      setServiceName(""); setServiceDuration(""); setServicePrice("");
      router.refresh(); // Atualiza a lista de serviços que fica no ManagementLists
    } else {
      toast.error("Erro ao adicionar serviço.");
    }
  };

  // FUNÇÃO: ADICIONAR BARBEIRO
  const handleAddBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/barbers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: barberName,
        email: barberEmail,
        phone: barberPhone,
        password: barberPassword,
        commissionRate: barberCommission,
        offDay: barberOffDay
      })
    });

    if (res.ok) {
      toast.success("Barbeiro adicionado com sucesso!");
      setBarberName(""); setBarberEmail(""); setBarberPhone("");
      setBarberPassword(""); setBarberCommission("");
      router.refresh(); // Atualiza a lista de barbeiros
    } else {
      toast.error("Erro ao adicionar barbeiro. Verifique se o e-mail já existe.");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

      {/* --- FORMULÁRIO DE SERVIÇO --- */}
      <div className="bg-[#111111] p-8 rounded-2xl border border-zinc-800 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-yellow-500">✂️</span> Novo Serviço
        </h2>
        <form onSubmit={handleAddService} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Nome do Serviço</label>
            <input required type="text" value={serviceName} onChange={e => setServiceName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-yellow-500 transition-colors" placeholder="Ex: Corte Degradê" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Duração (minutos)</label>
              <input required type="number" value={serviceDuration} onChange={e => setServiceDuration(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-yellow-500" placeholder="Ex: 30" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Preço (R$)</label>
              <input required type="number" step="0.01" value={servicePrice} onChange={e => setServicePrice(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-yellow-500" placeholder="Ex: 45.00" />
            </div>
          </div>
          <button type="submit" className="w-full mt-4 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold py-3 rounded-xl transition-all active:scale-[0.98]">
            Salvar Serviço
          </button>
        </form>
      </div>

      {/* --- FORMULÁRIO DE BARBEIRO --- */}
      <div className="bg-[#111111] p-8 rounded-2xl border border-zinc-800 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-yellow-500">💈</span> Novo Barbeiro
        </h2>
        <form onSubmit={handleAddBarber} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Nome Completo</label>
            <input required type="text" value={barberName} onChange={e => setBarberName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-yellow-500 transition-colors" placeholder="Ex: Marcos Silva" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">E-mail (Login)</label>
              <input required type="email" value={barberEmail} onChange={e => setBarberEmail(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-yellow-500" placeholder="marcos@exemplo.com" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Senha de Acesso</label>
              <input required type="text" value={barberPassword} onChange={e => setBarberPassword(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-yellow-500" placeholder="Defina uma senha" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-sm text-zinc-400 mb-1">Comissão (%)</label>
              <input required type="number" value={barberCommission} onChange={e => setBarberCommission(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-yellow-500" placeholder="40" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-zinc-400 mb-1">Dia de Folga</label>
              <select value={barberOffDay} onChange={e => setBarberOffDay(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-yellow-500 appearance-none">
                <option value="1">Segunda-feira</option>
                <option value="2">Terça-feira</option>
                <option value="3">Quarta-feira</option>
                <option value="4">Quinta-feira</option>
                <option value="5">Sexta-feira</option>
                <option value="6">Sábado</option>
                <option value="0">Domingo</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Telefone (WhatsApp)</label>
            <input required type="tel" value={barberPhone} onChange={e => setBarberPhone(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-yellow-500" placeholder="11999999999" />
          </div>
          <button type="submit" className="w-full mt-4 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold py-3 rounded-xl transition-all active:scale-[0.98]">
            Salvar Barbeiro
          </button>
        </form>
      </div>

    </div>
  );
}