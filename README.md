# 💈 BarberPro - SaaS para Barbearias

<p align="center">
  <img src="./public/pwa-logo.png" alt="BarberPro Logo" width="128" height="128" style="border-radius: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
</p>

<p align="center">
  <img alt="Status do Projeto" src="https://img.shields.io/badge/Status-Desenvolvimento-yellow?style=for-the-badge">
  <img alt="Licença" src="https://img.shields.io/badge/License-MIT-black?style=for-the-badge">
</p>

<p align="center">
  <strong>O BarberPro é uma plataforma SaaS moderna e elegante projetada para digitalizar a gestão de barbearias.</strong>
</p>

Ele oferece uma experiência de agendamento fluida para os clientes e um painel de controle robusto para donos de barbearias e profissionais, com identidade visual Dark & Gold premium.

---

## 🔗 Live Demo

🚀 **Confira o projeto online:** [Link para o Deploy no Vercel]

---

## 📸 Screenshots

Aqui estão alguns visuais do sistema:

### 🏠 Landing Page & Agendamento do Cliente
<div style="display: flex; gap: 10px; flex-wrap: wrap;">
  <img src="./screenshots/home.png" alt="Home Page" width="48%">
  <img src="./screenshots/booking.png" alt="Fluxo de Agendamento" width="48%">
</div>

### 🛠️ Painel Administrativo (Gerenciamento)
<div style="display: flex; gap: 10px; flex-wrap: wrap;">
  <img src="./screenshots/admin_dashboard.png" alt="Admin Dashboard" width="48%">
  <img src="./screenshots/admin_manage.png" alt="Gerenciar Equipe" width="48%">
</div>

---

## 🔥 Funcionalidades Principais

O BarberPro possui um sistema de controle de acesso baseado em regras (RBAC) com três níveis: **Cliente, Barbeiro e Dono (Owner)**.

### Para Clientes (Web & PWA)
- **Login Social:** Autenticação segura e rápida via GitHub (NextAuth).
- **Fluxo de Agendamento Dinâmico:** Escolha de Barbeiro ➡️ Serviços (múltiplos) ➡️ Data ➡️ Horário.
- **Validação de Horário Atual:** O sistema impede agendamentos em horários que já passaram no dia atual.
- **Meus Agendamentos:** Painel para visualizar próximos horários e histórico.
- **Ações Rápidas:** Botões customizados para Cancelar ou Reagendar (em conformidade com regras de negócio).
- **Experiência PWA:** Instalável no celular para acesso instantâneo.

### Para Donos de Barbearia (Admin)
- **Gestão de Equipe (CRUD):** Cadastro completo de barbeiros (comissão, dias de folga, horários de trabalho).
- **Gestão de Serviços (CRUD):** Cadastro de serviços com preço, duração e nome.
- **Serialização de Dados Decimal:** Tratamento de valores monetários vindos do Prisma para compatibilidade com Client Components.
- **Exclusão Inteligente de Barbeiro:** Se um barbeiro com agendamentos futuros for excluído, o sistema executa um algoritmo que **redistribui** automaticamente os agendamentos para outros barbeiros disponíveis na mesma barbearia, garantindo que o cliente não fique sem atendimento.

---

## 🛠️ Stack Tecnológico

Este projeto utiliza o que há de mais moderno no ecossistema JavaScript/TypeScript.

- **Framework:** [Next.js 14+](https://nextjs.org/) (App Router, Server Components).
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/).
- **Database ORM:** [Prisma ORM](https://www.prisma.io/).
- **Banco de Dados:** PostgreSQL (hospedado no [Neon](https://neon.tech/) ou [Supabase](https://supabase.com/)).
- **Autenticação:** [NextAuth.js](https://next-auth.js.org/).
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/).
- **Deploy:** [Vercel](https://vercel.com/).

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js (v18+)
- Git
- Uma instância do PostgreSQL rodando (localmente ou na nuvem)

### Passo a Passo

1.  **Clonar o Repositório:**
    ```bash
    git clone [https://github.com/SEU_USUARIO/barber-saas.git](https://github.com/SEU_USUARIO/barber-saas.git)
    cd barber-saas
    ```

2.  **Instalar Dependências:**
    ```bash
    npm install
    ```

3.  **Configurar Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz do projeto baseado no `.env.example` (que você deve criar) e preencha as informações:

    ```bash
    # DATABASE
    DATABASE_URL="postgresql://user:password@localhost:5432/barberdb?schema=public"

    # NEXT AUTH
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="um_segredo_muito_forte"

    # GITHUB OAUTH (Para Login)
    GITHUB_ID=""
    GITHUB_SECRET=""
    ```

4.  **Sincronizar Banco de Dados (Prisma):**
    ```bash
    # Gera o cliente do Prisma
    npx prisma generate
    # Cria as tabelas no banco de dados
    npx prisma db push
    ```

5.  **Rodar o Projeto:**
    ```bash
    npm run dev
    ```

Abra `http://localhost:3000` no seu navegador.

---

## 🗺️ Roadmap (Próximos Passos)

- [ ]  **Dashboard de BI (Business Intelligence):** Gráficos de faturamento e comissão para o dono.
- [ ]  **Sistema de Avaliações:** Clientes podem avaliar o serviço e o barbeiro.
- [ ]  **Notificações via WhatsApp:** Envio automático de lembretes de agendamento.
- [ ]  **Light Mode:** Alternância de tema para melhor acessibilidade.

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">
  Desenvolvido com ❤️ por <a href="https://github.com/PabloLima0">Pablo Lima dos Santos</a>.
</p>
