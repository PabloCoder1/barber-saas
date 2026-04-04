import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (currentUser?.role !== "OWNER") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const { name, email, phone, password, commissionRate, offDay } = await req.json();

    // LÓGICA AUTO-HEALING
    let shop = await prisma.shop.findFirst();

    if (!shop) {
      shop = await prisma.shop.create({
        data: {
          name: "BarberPro Oficial",
          slug: "barberpro-oficial", // <--- ADICIONE ESTA LINHA!
          ownerId: currentUser.id
        }
      });
    }

    // 1. Cria a conta de Usuário (com cargo BARBER)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash: password,
        role: "BARBER"
      }
    });

    // 2. Cria o Perfil de Barbeiro atrelado ao Usuário e à Barbearia recém encontrada/criada
    const barber = await prisma.barber.create({
      data: {
        userId: user.id,
        shopId: shop.id,
        commissionRate: Number(commissionRate) / 100,
        offDay: parseInt(offDay, 10), // O ", 10" garante que é base decimal
        workStart: "09:00",
        workEnd: "19:00",
        lunchStart: "12:00",
        lunchEnd: "13:00"
      }
    });

    return NextResponse.json({ success: true, barber });
  } catch (error) {
    console.error("Erro Barber API:", error);
    return NextResponse.json({ error: "Erro ao cadastrar barbeiro." }, { status: 500 });
  }
}


export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });

    return await prisma.$transaction(async (tx) => {

      // Busca todos os agendamentos futuros do barbeiro que será deletado
      const appointments = await tx.appointment.findMany({
        where: {
          barberId: id,
          startTime: { gte: new Date() },
          status: "CONFIRMED"
        }
      });

      // Tentativa de Redistribuição
      for (const app of appointments) {
        const appDay = app.startTime.getDay();

        // Procuramos alguém disponível nesse horário exato
        const availableBarber = await tx.barber.findFirst({
          where: {
            id: { not: id }, // Não pode ser o deletado
            offDay: { not: appDay }, // Não pode ser folga dele
            appointments: {
              none: {
                startTime: app.startTime, // Não pode ter agendamento começando igual
                status: "CONFIRMED"
              }
            }
          }
        });

        if (!availableBarber) {
          const time = app.startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          const date = app.startTime.toLocaleDateString('pt-BR');
          throw new Error(`Não há barbeiros disponíveis para o agendamento de ${date} às ${time}.`);
        }

        // Se achou, transfere o agendamento!
        await tx.appointment.update({
          where: { id: app.id },
          data: { barberId: availableBarber.id }
        });
      }

      // 5. Se chegamos aqui, todos foram transferidos. Agora tratamos o histórico (Passado).
      // Como o Prisma não deixa deletar se houver histórico, vamos setar o barberId como NULL 
      // ou deletar os agendamentos antigos também. O ideal em SaaS é setar NULL.
      await tx.appointment.deleteMany({
        where: { barberId: id }
      });

      // 6. Finalmente deletamos o barbeiro
      await tx.barber.delete({ where: { id } });

      return NextResponse.json({ success: true });
    });

  } catch (error: any) {
    console.error("Erro na redistribuição:", error.message);
    return NextResponse.json({
      error: error.message || "Erro ao processar redistribuição de equipe."
    }, { status: 400 });
  }
}