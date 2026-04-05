'use client';

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";

type Barber = { id: string; user: { name: string }; offDay: number; avgRating: number; totalReviews: number };
type Service = { id: string; name: string; price: number; duration: number };
type ShopProps = { barbers: Barber[]; services: Service[] };

export default function BookingForm({ shop }: { shop: ShopProps }) {
    const { data: session } = useSession();
    const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
    
    const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [isLoadingTimes, setIsLoadingTimes] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dados temporários do cliente (Idealmente vêm do Login/Sessão)
    const [clientName, setClientName] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [clientPhone, setClientPhone] = useState("");

    const toggleService = (serviceId: string) => {
        setSelectedServices((prev) =>
            prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
        );
    };

    const selectedServicesData = shop.services.filter(s => selectedServices.includes(s.id));
    const totalPrice = selectedServicesData.reduce((acc, s) => acc + s.price, 0);
    const totalDuration = selectedServicesData.reduce((acc, s) => acc + s.duration, 0);
    const barberData = shop.barbers.find(b => b.id === selectedBarber);

    // 🧠 MOTOR DE DATAS CORRIGIDO (Apenas 7 dias)
    const generateAvailableDays = () => {
        if (!barberData) return [];

        const days = [];
        const today = new Date();

        // Roda exatamente 7 vezes (de hoje até daqui 6 dias)
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(today.getDate() + i);
            const dayOfWeek = date.getDay(); 

            // Remove Domingo (0) e o dia de folga específico do barbeiro
            if (dayOfWeek !== 0 && dayOfWeek !== barberData.offDay) {
                days.push(date);
            }
        }
        return days;
    };

    const availableDays = generateAvailableDays();

    // Busca Horários API
    useEffect(() => {
        async function fetchTimes() {
            if (!selectedDate || !selectedBarber || totalDuration === 0) return;
            setIsLoadingTimes(true);
            setSelectedTime(null); 
            const dateStr = selectedDate.toISOString().split('T')[0];
            try {
                const res = await fetch(`/api/availability?barberId=${selectedBarber}&date=${dateStr}&duration=${totalDuration}`);
                const data = await res.json();
                setAvailableTimes(data.availableTimes || []);
            } catch (error) {
                console.error("Erro ao buscar horários", error);
            } finally {
                setIsLoadingTimes(false);
            }
        }
        if (step === 4) fetchTimes();
    }, [selectedDate, selectedBarber, totalDuration, step]);

    const handleBooking = async () => {
        if (!selectedDate || !selectedTime || !selectedBarber) return;
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    barberId: selectedBarber,
                    serviceIds: selectedServices,
                    date: selectedDate.toISOString().split('T')[0],
                    time: selectedTime,
                    // Se estiver logado, usa os dados da sessão. Se não, usa os inputs.
                    clientName: session?.user?.name || clientName,
                    clientEmail: session?.user?.email || clientEmail,
                    clientPhone: clientPhone 
                })
            });
            if (res.ok) setStep(5);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Textos do Stepper
    const stepTitles = ["Barbeiro", "Serviços", "Data", "Horário"];

    if (step === 5) {
        return (
            <div className="text-center py-24 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_-10px_rgba(234,179,8,0.5)]">
                    <svg className="w-12 h-12 text-zinc-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">Agendamento Confirmado!</h2>
                <p className="text-zinc-400 text-lg mb-8">Seu horário está garantido. Te esperamos lá!</p>
                <button onClick={() => window.location.reload()} className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white px-8 py-3 rounded-xl font-bold transition-colors">
                    Fazer novo agendamento
                </button>
            </div>
        );
    }

    // Regra de validação para habilitar o botão de Confirmar
    const isGuestValid = clientName.length > 0 && clientEmail.length > 0 && clientPhone.length > 0;
    const isUserValid = session?.user && clientPhone.length > 0;
    const canConfirm = selectedTime && !isSubmitting && (isGuestValid || isUserValid);

    return (
        <div className="max-w-5xl mx-auto mt-8 font-sans">
            
            {/* --- STEPPER (Linha do Tempo Visual) --- */}
            <div className="mb-16 relative px-4">
                <div className="absolute top-5 left-10 right-10 h-1 bg-zinc-900 -z-10 rounded-full"></div>
                <div 
                    className="absolute top-5 left-10 h-1 bg-yellow-500 -z-10 rounded-full transition-all duration-500" 
                    style={{ width: `${((step - 1) / 3) * 100}%`, maxWidth: 'calc(100% - 5rem)' }}
                ></div>
                
                <div className="flex justify-between">
                    {[1, 2, 3, 4].map((num) => (
                        <div key={num} className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-3 transition-colors ${
                                step >= num ? 'bg-yellow-500 text-zinc-950 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                            }`}>
                                {num}
                            </div>
                            <span className={`text-xs font-medium ${step >= num ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                {stepTitles[num - 1]}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- CONTEÚDO DINÂMICO --- */}
            <div className="min-h-[400px]">
                
                {/* PASSO 1: BARBEIRO */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <h2 className="text-3xl font-bold text-white mb-8">Escolha seu barbeiro</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {shop.barbers.map((barber) => (
                                <button
                                    key={barber.id}
                                    onClick={() => setSelectedBarber(barber.id)}
                                    className={`p-6 rounded-2xl flex flex-col items-center justify-center text-center transition-all ${
                                        selectedBarber === barber.id
                                            ? 'bg-zinc-900 border-2 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.15)]'
                                            : 'bg-[#111111] border-2 border-transparent hover:border-zinc-800'
                                    }`}
                                >
                                    <div className="text-5xl mb-4">👨‍🦱</div>
                                    <h3 className="font-bold text-white mb-1">{barber.user.name}</h3>
                                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                                      {barber.totalReviews > 0 ? (
                                        <>
                                          <span className="text-yellow-500">⭐</span>
                                          {barber.avgRating.toFixed(1)} ({barber.totalReviews} {barber.totalReviews === 1 ? 'avaliação' : 'avaliações'})
                                        </>
                                      ) : (
                                        <span className="text-zinc-600">Sem avaliações ainda</span>
                                      )}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* PASSO 2: SERVIÇOS */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <h2 className="text-3xl font-bold text-white mb-8">Escolha os serviços</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {shop.services.map((service) => (
                                <button
                                    key={service.id}
                                    onClick={() => toggleService(service.id)}
                                    className={`p-6 rounded-2xl text-left transition-all ${
                                        selectedServices.includes(service.id)
                                            ? 'bg-zinc-900 border-2 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.15)]'
                                            : 'bg-[#111111] border-2 border-transparent hover:border-zinc-800'
                                    }`}
                                >
                                    <h3 className="font-bold text-white text-lg mb-1">{service.name}</h3>
                                    <p className="text-sm text-zinc-500">{service.duration} min • R$ {service.price.toFixed(2)}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* PASSO 3: DATA */}
                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <h2 className="text-3xl font-bold text-white mb-8">Escolha a data</h2>
                        <div className="flex flex-wrap gap-4">
                            {availableDays.map((date, index) => {
                                const isSelected = selectedDate?.toDateString() === date.toDateString();
                                const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
                                const dayNumber = date.getDate();
                                const monthName = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');

                                return (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedDate(date)}
                                        className={`w-28 py-6 rounded-2xl flex flex-col items-center justify-center transition-all ${
                                            isSelected
                                                ? 'bg-zinc-900 border-2 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.15)] text-white'
                                                : 'bg-[#111111] border-2 border-transparent text-zinc-400 hover:border-zinc-800 hover:text-zinc-200'
                                        }`}
                                    >
                                        <span className="text-sm font-medium mb-1">{dayName}.</span>
                                        <span className="text-3xl font-bold text-white mb-1">{dayNumber}</span>
                                        <span className="text-xs">{monthName}.</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* PASSO 4: HORÁRIO & RESUMO */}
{step === 4 && (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
        <h2 className="text-3xl font-bold text-white mb-8">Escolha o horário</h2>
        
        {isLoadingTimes ? (
            <div className="text-yellow-500 py-8">Carregando horários...</div>
        ) : (
            (() => {
                // --- LÓGICA DE FILTRO DE HORÁRIO ATUAL ---
                const now = new Date();
                
                // 1. Pegamos a data de hoje no formato YYYY-MM-DD (fuso BR)
                const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
                
                // 2. Pegamos a data selecionada no mesmo formato
                const selectedDateStr = selectedDate?.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

                // 3. Adicionamos uma margem de 15 min para o cliente não agendar em cima da hora
                const bufferTime = new Date(now.getTime() + 15 * 60000);
                const limitTime = bufferTime.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    timeZone: 'America/Sao_Paulo' 
                });

                // 4. Filtramos: se for hoje, só mostra o que for maior que o limitTime
                const filteredTimes = availableTimes.filter(time => {
                    if (selectedDateStr !== todayStr) return true; // Se não for hoje, mostra tudo
                    return time > limitTime; // Se for hoje, compara as strings (ex: "18:00" > "17:20")
                });

                if (filteredTimes.length === 0) {
                    return (
                        <div className="text-zinc-500 py-8">
                            Nenhum horário disponível para o restante deste dia. Tente outra data!
                        </div>
                    );
                }

                return (
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-12">
                        {filteredTimes.map((time) => (
                            <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                                    selectedTime === time
                                        ? 'bg-zinc-900 border-yellow-500 text-yellow-500'
                                        : 'bg-transparent border-zinc-800 text-zinc-300 hover:border-zinc-600'
                                }`}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                );
            })()
        )}

                        {/* CAIXA DE RESUMO */}
                        {selectedTime && (
                            <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-zinc-800">
                                <h3 className="text-xl font-bold text-white mb-6">Resumo do Agendamento</h3>
                                
                                <div className="space-y-4 mb-6 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Barbeiro:</span>
                                        <span className="text-white font-medium">{barberData?.user.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Serviços:</span>
                                        <span className="text-white font-medium text-right max-w-[200px]">
                                            {selectedServicesData.map(s => s.name).join(' + ')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Data:</span>
                                        <span className="text-white font-medium">{selectedDate?.toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Horário:</span>
                                        <span className="text-white font-medium">{selectedTime}</span>
                                    </div>
                                    <div className="flex justify-between pb-4 border-b border-zinc-800">
                                        <span className="text-zinc-400">Duração:</span>
                                        <span className="text-white font-medium">{totalDuration} minutos</span>
                                    </div>
                                    <div className="flex justify-between pt-2">
                                        <span className="text-lg font-bold text-white">Total:</span>
                                        <span className="text-lg font-bold text-yellow-500">R$ {totalPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                                
                                {/* 🔗 VERIFICAÇÃO DE SESSÃO AQUI */}
                                <div className="mt-8 pt-6 border-t border-zinc-800 space-y-4">
                                    {session ? (
                                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg mb-4">
                                            <p className="text-sm text-yellow-500">
                                                Agendando como <strong className="text-white">{session.user?.name}</strong> ({session.user?.email})
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-xs text-zinc-500 mb-2">Por favor, informe seus dados para confirmar:</p>
                                            <input type="text" placeholder="Seu Nome" onChange={e => setClientName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white text-sm outline-none focus:border-yellow-500 mb-4" />
                                            <input type="email" placeholder="E-mail" onChange={e => setClientEmail(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white text-sm outline-none focus:border-yellow-500 mb-4" />
                                        </>
                                    )}
                                    <input type="tel" placeholder="WhatsApp" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white text-sm outline-none focus:border-yellow-500" />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* --- NAVEGAÇÃO DE BOTÕES (Rodapé) --- */}
            <div className="mt-12 flex justify-between items-center border-t border-zinc-900 pt-8 mb-12">
                {step > 1 ? (
                    <button 
                        onClick={() => setStep(prev => prev - 1 as any)} 
                        className="px-6 py-3 border border-zinc-700 hover:bg-zinc-800 text-white rounded-xl font-bold transition-colors"
                    >
                        Voltar
                    </button>
                ) : <div></div>}

                {step < 4 ? (
                    <button 
                        onClick={() => setStep(prev => prev + 1 as any)}
                        disabled={(step === 1 && !selectedBarber) || (step === 2 && selectedServices.length === 0) || (step === 3 && !selectedDate)}
                        className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 px-8 py-3 rounded-xl font-bold transition-colors"
                    >
                        Próximo
                    </button>
                ) : (
                    <button 
                        onClick={handleBooking}
                        disabled={!canConfirm}
                        className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 px-8 py-3 rounded-xl font-bold transition-colors flex items-center gap-2"
                    >
                        {isSubmitting ? "Confirmando..." : "Confirmar Agendamento"}
                    </button>
                )}
            </div>
        </div>
    );
}