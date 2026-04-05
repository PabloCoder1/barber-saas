// src/app/admin/gerenciar/page.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";
import ManagementForms from "./ManagementForms";
import ManagementLists from "./ManagementLists";
import AdminMobileNav from "@/components/AdminMobileNav";

export default async function GerenciarPage() {
  
  // 1. Busca os serviços brutos do banco
  const rawServices = await prisma.service.findMany({
    orderBy: { name: 'asc' }
  });

  // 2. Busca os barbeiros brutos do banco
  const rawBarbers = await prisma.barber.findMany({
    include: { user: true },
    orderBy: { user: { name: 'asc' } }
  });

  // --- A MÁGICA DA SERIALIZAÇÃO ---
  // Convertemos os objetos Decimal em Números puros para o React não reclamar
  const services = rawServices.map(s => ({
    ...s,
    price: Number(s.price), // Converte Decimal para Number
  }));

  const barbers = rawBarbers.map(b => ({
    ...b,
    commissionRate: Number(b.commissionRate), // Converte Decimal para Number
  }));

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-zinc-100 font-sans pb-20">
      
      {/* NAVBAR */}
      <nav className="max-w-6xl mx-auto flex justify-between items-center mb-12 border-b border-zinc-900 pb-6">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-white tracking-tight">
            BarberPro <span className="text-zinc-600 font-normal hidden sm:inline">| Gerenciar</span>
          </span>
        </div>
        <div className="hidden md:flex gap-4">
          <Link href="/admin" className="text-yellow-500 hover:text-yellow-400 font-medium text-sm">
            ← Voltar ao Painel
          </Link>
        </div>
        <div className="flex md:hidden">
          <AdminMobileNav />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto">
        
        {/* Componente de formulários (Client Component) */}
        <ManagementForms />

        {/* Componente de listas (Client Component) - Agora com dados "limpos" */}
        <ManagementLists barbers={barbers} services={services} />

      </div>
    </div>
  );
}