import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// POST /api/reviews — cliente envia avaliação
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { appointmentId, rating, comment } = await req.json();

    if (!appointmentId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    // Verifica se o agendamento existe, está concluído e pertence ao cliente
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { client: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
    }

    if (appointment.client.email !== session.user.email) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    if (appointment.status !== "COMPLETED") {
      return NextResponse.json({ error: "Só é possível avaliar atendimentos concluídos" }, { status: 400 });
    }

    // Verifica se já avaliou
    const existing = await prisma.review.findUnique({
      where: { appointmentId },
    });
    if (existing) {
      return NextResponse.json({ error: "Você já avaliou este atendimento" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        appointmentId,
        barberId: appointment.barberId,
        clientId: appointment.clientId,
        rating,
        comment: comment || null,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("Erro ao criar avaliação:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// GET /api/reviews?barberId=xxx — busca média de avaliação de um barbeiro
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const barberId = searchParams.get("barberId");

  if (!barberId) {
    return NextResponse.json({ error: "barberId obrigatório" }, { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: { barberId },
    select: { rating: true },
  });

  const total = reviews.length;
  const average = total > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / total
    : 0;

  return NextResponse.json({ average: Math.round(average * 10) / 10, total });
}
