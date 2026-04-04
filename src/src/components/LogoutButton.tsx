'use client';

import { signOut } from "next-auth/react";

interface LogoutButtonProps {
  variant?: 'ghost' | 'outline';
  className?: string;
}

export default function LogoutButton({ variant = 'ghost', className }: LogoutButtonProps) {
  const baseClass =
    variant === 'outline'
      ? "border border-zinc-800 hover:bg-zinc-900 text-white px-5 py-2.5 rounded-lg font-bold transition-colors text-sm"
      : "text-zinc-500 hover:text-white font-medium transition-colors text-sm";

  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className={className ?? baseClass}
    >
      Sair
    </button>
  );
}
