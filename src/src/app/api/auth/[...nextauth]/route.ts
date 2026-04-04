import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    // 1. Provedor do Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    // 2. Provedor de E-mail/Senha (Que já tínhamos para Admin/Barbeiro)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        const isPasswordValid = credentials.password === user.passwordHash;
        if (!isPasswordValid) return null;
        
        return { id: user.id, name: user.name, email: user.email, role: user.role } as any;
      }
    })
  ],
  callbacks: {
    // Interceptamos o momento exato do Login
    async signIn({ user, account }) {
      // Se o login for pelo Google, garantimos que o usuário existe no nosso banco
      if (account?.provider === "google" && user.email) {
        const dbUser = await prisma.user.upsert({
          where: { email: user.email },
          update: {},
          create: {
            name: user.name || "Usuário Google",
            email: user.email,
            role: "CLIENT",
            passwordHash: "", 
            phone: "", // <--- BASTA ADICIONAR ESTA LINHA AQUI
          }
        });
        // Vincula o ID e a Role do nosso banco ao cookie do NextAuth
        user.id = dbUser.id;
        (user as any).role = dbUser.role;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "uma_chave_super_secreta_para_desenvolvimento",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };