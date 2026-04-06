# 💈 BarberPro - SaaS de Gestão para Barbearias

<p align="center">
  <img alt="Status do Projeto" src="https://img.shields.io/badge/Status-Produção-success?style=for-the-badge">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white">
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white">
</p>

<p align="center">
  <strong>Uma plataforma SaaS moderna, responsiva e instalável (PWA) para digitalizar a gestão de barbearias e a experiência de agendamento dos clientes.</strong>
</p>

---

## 🔗 Live Demo

🚀 **Confira o projeto online:** https://barber-saas-gamma.vercel.app/

---

## 📸 Visão Geral

O BarberPro oferece uma experiência premium tanto para o cliente que deseja agendar um corte, quanto para o dono da barbearia que precisa gerenciar sua equipe e faturamento. O sistema conta com uma identidade visual nativa *Dark & Gold*, suporte a *Light Mode* e notificações elegantes.

### 🏠 Experiência do Cliente
- **Login e Cadastro Seguro:** Autenticação via Google (OAuth) ou criação de conta com E-mail e Senha.
- **Fluxo de Agendamento Inteligente:** Seleção de Profissional ➡️ Serviço ➡️ Data ➡️ Horário (com bloqueio de horários passados no dia atual).
- **Painel de Agendamentos:** Histórico completo e visualização clara dos próximos horários.
- **Progressive Web App (PWA):** Instalável diretamente na tela inicial do smartphone (iOS e Android) proporcionando experiência de aplicativo nativo.

### 🛠️ Painel Gerencial (Admin)
- **Controle de Acesso (RBAC):** Proteção de rotas baseada em níveis (`OWNER`, `BARBER`, `CLIENT`).
- **Dashboard Financeiro:** Cálculo automático de faturamento bruto, comissões de profissionais e lucro líquido da barbearia.
- **Gestão de Equipe e Serviços (CRUD):** Adição, edição e remoção de barbeiros e cortes.
- **Exclusão Inteligente:** Ao remover um barbeiro da equipe, o sistema protege os clientes com agendamentos futuros transferindo-os de forma inteligente (ou bloqueando a ação se necessário).

---

## 🛠️ Stack Tecnológico

O projeto foi construído utilizando as ferramentas mais modernas do ecossistema React/Node:

- **Framework:** [Next.js 14+](https://nextjs.org/) (App Router, Server Actions, Server Components).
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/).
- **Banco de Dados:** PostgreSQL hospedado no [Supabase](https://supabase.com/).
- **ORM:** [Prisma ORM](https://www.prisma.io/).
- **Autenticação:** [NextAuth.js](https://next-auth.js.org/) (Google Provider & Credentials Provider com `bcryptjs`).
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/).
- **UI/UX Extras:** `next-themes` (Dark/Light mode) e `sonner` (Toasts de notificação).
- **Deploy:** [Vercel](https://vercel.com/).

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js (v18+)
- Git
- Uma conta no Supabase (ou instância local do PostgreSQL)

### Passo a Passo

1. **Clonar o Repositório:**
   ```bash
   git clone [https://github.com/SEU_USUARIO/barber-saas.git](https://github.com/SEU_USUARIO/barber-saas.git)
   cd barber-saas
