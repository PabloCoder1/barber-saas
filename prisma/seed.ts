import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Criar o Usuário Dono (Você)
  const owner = await prisma.user.upsert({
    where: { email: 'pablolimacoder@gmail.com' },
    update: {},
    create: {
      name: 'Pablo Lima',
      email: 'pablolimacoder@gmail.com',
      phone: '13991560814',
      passwordHash: '123456', // Depois usaremos o bcrypt
      role: 'OWNER',
    },
  });

  // 2. Criar a Barbearia
  const shop = await prisma.shop.upsert({
    where: { slug: 'barbearia-do-pablo' },
    update: {},
    create: {
      name: 'Barbearia do Pablo',
      slug: 'barbearia-do-pablo',
      ownerId: owner.id,
    },
  });

  // 3. Criar os Serviços (Gerenciados pelo Dono)
  const corte = await prisma.service.create({
    data: {
      name: 'Corte',
      price: 50.00,
      duration: 30,
      shopId: shop.id,
    },
  });

  const barba = await prisma.service.create({
    data: {
      name: 'Barba',
      price: 35.00,
      duration: 20,
      shopId: shop.id,
    },
  });

  // 4. Criar Barbeiros
  // Barbeiro 1: Folga na Segunda (1), Comissão 40%
  await prisma.barber.create({
    data: {
      userId: (await prisma.user.create({
        data: { name: 'João Barbeiro', email: 'joao@teste.com', phone: '11888888888', passwordHash: '123', role: 'BARBER' }
      })).id,
      shopId: shop.id,
      commissionRate: 0.4,
      offDay: 1, // Segunda
    },
  });

  console.log('✅ Banco de dados populado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });