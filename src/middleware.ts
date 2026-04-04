import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Regra de Sênior: Se for o painel de ADMIN, só o dono acessa.
    // Se um barbeiro tentar acessar o admin, mandamos ele para o painel dele.
    if (path.startsWith("/admin") && token?.role !== "OWNER") {
      return NextResponse.redirect(new URL("/barber", req.url));
    }
  },
  {
    callbacks: {
      // Retorna true se estiver logado (deixa passar), false se não estiver (manda pro /login)
      authorized: ({ token }) => !!token, 
    },
  }
);

// Definimos quais rotas o middleware vai proteger
export const config = {
  matcher: ["/admin/:path*", "/barber/:path*"], 
};