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
    const { name, duration, price } = await req.json();

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

    const service = await prisma.service.create({
      data: {
        shopId: shop.id,
        name,
        description: "",
        duration: Number(duration),
        price: Number(price),
      }
    });

    return NextResponse.json({ success: true, service });
  } catch (error) {
    console.error("Erro Service API:", error);
    return NextResponse.json({ error: "Erro ao criar serviço" }, { status: 500 });
  }
}


export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });

    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Proteção de Sênior: Se o serviço já tiver agendamentos, o banco bloqueia a exclusão!
    if (error.code === 'P2003') {
      return NextResponse.json({ error: "Não é possível excluir um serviço que já possui agendamentos." }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao excluir serviço" }, { status: 500 });
  }
}