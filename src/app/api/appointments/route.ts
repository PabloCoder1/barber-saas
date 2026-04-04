import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { barberId, date, time, serviceIds, clientName, clientEmail, clientPhone } = body;

    // 1. Validação básica de segurança
    if (!barberId || !serviceIds || !date || !time || !clientName || !clientEmail || !clientPhone) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // 2. Busca o Barbeiro e a Barbearia (Shop)
    const barber = await prisma.barber.findUnique({
      where: { id: barberId },
      include: { shop: true }
    });
    if (!barber) return NextResponse.json({ error: "Barbeiro não encontrado" }, { status: 404 });

    // 3. Recalcula o Preço e o Tempo no Backend
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } }
    });
    
    const totalPrice = services.reduce((acc, s) => acc + Number(s.price), 0);
    const totalDuration = services.reduce((acc, s) => acc + s.duration, 0);

    // 4. Monta as Datas Exatas (Blindagem de Fuso Horário - America/Sao_Paulo)
    // Extrai o Ano, Mês e Dia da data fornecida pelo Frontend
    const [year, month, day] = date.split('-');
    // Extrai a Hora e o Minuto
    const [hour, minute] = time.split(':');
    
    // Montamos uma string ISO perfeita já com o fuso do Brasil (-03:00) travado!
    const startTime = new Date(`${year}-${month}-${day}T${hour}:${minute}:00-03:00`);

    // Criamos a data final somando a duração
    const endTime = new Date(startTime.getTime() + totalDuration * 60000);
    
    // Data pura para salvar no banco (também blindada para o dia correto)
    const pureDate = new Date(`${year}-${month}-${day}T00:00:00-03:00`);

    // 5. Encontra ou Cria o Cliente (Upsert)
    const client = await prisma.user.upsert({
      where: { email: clientEmail },
      update: { name: clientName, phone: clientPhone },
      create: {
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        passwordHash: "oauth_ou_sem_senha", 
        role: "CLIENT"
      }
    });

    // 6. Cria o Agendamento no Banco!
    const appointment = await prisma.appointment.create({
      data: {
        shopId: barber.shopId,
        clientId: client.id,
        barberId: barber.id,
        serviceId: services[0].id, // Pegamos o ID do serviço principal do combo
        date: pureDate, // Data pura blindada no fuso BR
        startTime: startTime, // Data com a hora exata blindada no fuso BR
        endTime: endTime,
        totalPrice,
        status: "CONFIRMED" // Já entra confirmado!
      }
    });

    return NextResponse.json({ success: true, appointment });

  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

// ROTA PARA ATUALIZAR STATUS (Atendido, Cancelado, etc)
export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ success: true, appointment: updatedAppointment });
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
} 