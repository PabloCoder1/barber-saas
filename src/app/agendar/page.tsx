import prisma from "@/lib/prisma";
import BookingForm from "@/components/BookingForm";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function AgendarPage() {
  const session = await getServerSession(authOptions);

  const shop = await prisma.shop.findFirst({
    include: {
      barbers: {
        include: {
          user: true,
          reviews: { select: { rating: true } },
        }
      },
      services: true,
    }
  });

  if (!shop) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Nenhuma barbearia cadastrada.</div>;

  const safeShopData = {
    barbers: shop.barbers.map(b => {
      const totalReviews = b.reviews.length;
      const avgRating = totalReviews > 0
        ? b.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
        : 0;
      return {
        id: b.id,
        user: { name: b.user.name },
        offDay: b.offDay,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews,
      };
    }),
    services: shop.services.map(s => ({
      id: s.id,
      name: s.name,
      duration: s.duration,
      price: Number(s.price)
    }))
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-32">

      {/* NAVBAR COM VOLTAR */}
      <nav className="max-w-4xl mx-auto px-6 py-5 flex justify-between items-center border-b border-zinc-900 mb-8">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
          </svg>
          <span className="text-xl font-bold text-white tracking-tight">BarberPro</span>
        </Link>
        <div className="flex items-center gap-3">
          {session ? (
            <Link href="/meus-agendamentos" className="text-zinc-400 hover:text-white text-sm transition-colors">
              Meus Agendamentos
            </Link>
          ) : (
            <Link href="/login" className="text-zinc-400 hover:text-white text-sm transition-colors">
              Entrar
            </Link>
          )}
          <Link href="/" className="text-zinc-500 hover:text-white font-medium transition-colors text-sm">
            ← Voltar
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white">{shop.name}</h1>
          <p className="text-zinc-400 mt-2">Agende seu horário com nossos profissionais</p>
        </header>
        <BookingForm shop={safeShopData} />
      </main>
    </div>
  );
}
