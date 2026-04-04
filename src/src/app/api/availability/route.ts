import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Função auxiliar para converter "09:00" em minutos totais (ex: 540)
// Isso facilita muito a matemática de "cabe ou não cabe"
function timeToMinutes(timeStr: string) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

// Função auxiliar para converter 540 de volta para "09:00"
function minutesToTime(minutes: number) {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const barberId = searchParams.get("barberId");
  const dateStr = searchParams.get("date"); // Formato esperado: YYYY-MM-DD
  const duration = parseInt(searchParams.get("duration") || "0", 10);

  if (!barberId || !dateStr || !duration) {
    return NextResponse.json({ error: "Faltam parâmetros" }, { status: 400 });
  }

  // 1. Busca os dados do barbeiro (horários de trabalho e almoço)
  const barber = await prisma.barber.findUnique({
    where: { id: barberId },
  });

  if (!barber) return NextResponse.json({ error: "Barbeiro não encontrado" }, { status: 404 });

  // 2. Busca os agendamentos já existentes neste dia para este barbeiro
  const targetDate = new Date(dateStr);
  
  // Como as datas variam por fuso horário, buscamos do começo ao fim do dia selecionado
  const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      barberId,
      status: { not: "CANCELED" }, // Ignora os cancelados
      startTime: { gte: startOfDay, lte: endOfDay },
    },
    select: { startTime: true, endTime: true },
  });

  // Converte os agendamentos do banco para "minutos desde a meia-noite"
  const bookedSlots = existingAppointments.map(app => ({
    start: app.startTime.getHours() * 60 + app.startTime.getMinutes(),
    end: app.endTime.getHours() * 60 + app.endTime.getMinutes(),
  }));

  // 3. Define os limites do dia baseados no perfil do barbeiro
  const workStart = timeToMinutes(barber.workStart); // Padrão "09:00" -> 540
  const workEnd = timeToMinutes(barber.workEnd);     // Padrão "19:00" -> 1140
  const lunchStart = timeToMinutes(barber.lunchStart); // Padrão "12:00" -> 720
  const lunchEnd = timeToMinutes(barber.lunchEnd);     // Padrão "13:00" -> 780

  const availableTimes: string[] = [];
  const interval = 30; // Vamos gerar blocos de 30 em 30 minutos

  // Verifica se o dia escolhido é hoje para não deixar agendar no passado
  const isToday = new Date().toDateString() === new Date(dateStr).toDateString();
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  // 4. O Motor: Percorre o dia do início ao fim do expediente
  for (let currentTime = workStart; currentTime + duration <= workEnd; currentTime += interval) {
    const serviceEndTime = currentTime + duration;

    // Regra A: Se for hoje, o horário já passou? (Damos 1 hora de antecedência de margem)
    if (isToday && currentTime < nowMinutes + 60) continue;

    // Regra B: O serviço esbarra no horário de almoço?
    const overlapsLunch = currentTime < lunchEnd && serviceEndTime > lunchStart;
    if (overlapsLunch) continue;

    // Regra C: O serviço esbarra em algum agendamento já feito?
    const overlapsAppointment = bookedSlots.some(
      (booking) => currentTime < booking.end && serviceEndTime > booking.start
    );
    if (overlapsAppointment) continue;

    // Se passou por todas as regras, o horário está LIVRE!
    availableTimes.push(minutesToTime(currentTime));
  }

  return NextResponse.json({ availableTimes });
}