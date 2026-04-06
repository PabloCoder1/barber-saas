// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs"; // Lembre-se que usamos o bcryptjs por causa da Vercel!

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // 1. Validação básica
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
    }

    // 2. Verifica se o e-mail já existe no banco
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Este e-mail já está em uso." }, { status: 400 });
    }

    // 3. Criptografa a senha antes de salvar (Segurança em 1º lugar)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Cria o usuário no banco como 'CLIENT'
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role: "CLIENT", // Todo novo usuário que se cadastra sozinho é um cliente
        phone: "", 
      }
    });

    return NextResponse.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } }, { status: 201 });

  } catch (error) {
    console.error("Erro no registro:", error);
    return NextResponse.json({ error: "Erro interno ao criar conta." }, { status: 500 });
  }
}