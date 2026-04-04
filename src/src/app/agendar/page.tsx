import prisma from "@/lib/prisma";
import BookingForm from "@/components/BookingForm";

export default async function AgendarPage() {
  const shop = await prisma.shop.findFirst({
    include: {
      barbers: { include: { user: true } },
      services: true,
    }
  });

  if (!shop) return <div>Banco vazio!</div>;

  // Transformação (Serialização) dos dados para o Client Component
  // Isso resolve o erro "Only plain objects can be passed..."
  const safeShopData = {
    barbers: shop.barbers.map(b => ({
      id: b.id,
      user: { name: b.user.name },
      offDay: b.offDay
    })),
    services: shop.services.map(s => ({
      id: s.id,
      name: s.name,
      duration: s.duration,
      // Convertendo o Decimal do Prisma para Number nativo
      price: Number(s.price) 
    }))
  };

  return (
    <main className="max-w-4xl mx-auto p-8 font-sans pb-32">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white">{shop.name}</h1>
        <p className="text-slate-400 mt-2">Agende seu horário com nossos profissionais</p>
      </header>
      
      {/* Passamos os dados limpos e serializáveis */}
      <BookingForm shop={safeShopData} /> 
    </main>
  );
}