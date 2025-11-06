# AutoTrack - Plataforma de Gestão Veicular

AutoTrack é uma aplicação web multiplataforma para gestão de veículos que conecta proprietários, oficinas e concessionárias. A aplicação oferece funcionalidades para registro de despesas, compartilhamento de informações, alertas de emergência e integração com serviços automotivos.

## 🚀 Funcionalidades

### Para Usuários

- **Sistema de Autenticação**: Login e cadastro com diferentes tipos de usuário
- **Gestão de Veículos**: Cadastro e gerenciamento de múltiplos veículos
- **Controle de Despesas**: Registro e acompanhamento de gastos veiculares
- **Grupos e Compartilhamento**: Criação de grupos para compartilhar informações
- **Alertas de Emergência**: Sistema de notificação para situações críticas
- **Localização de Serviços**: Mapa com oficinas e concessionárias próximas
- **Relatórios e Exportação**: Geração de relatórios em PDF e compartilhamento

### Tipos de Usuário

- **Básico (Gratuito)**: 1 veículo, 1 grupo, funcionalidades básicas
- **Avançado (R$ 9,90/mês)**: Até 5 veículos, 3 grupos, exportação PDF
- **Pro (R$ 19,90/mês)**: Veículos ilimitados, grupos ilimitados, relatórios avançados

### Para Empresas

- **Painel Administrativo**: Cadastro de oficinas e concessionárias
- **Gestão de Agendamentos**: Controle de solicitações de clientes
- **Perfil da Empresa**: Edição de informações e serviços

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 com TypeScript
- **Roteamento**: React Router DOM
- **Estilização**: Tailwind CSS (mobile-first)
- **Formulários**: React Hook Form
- **Notificações**: React Hot Toast
- **Ícones**: Lucide React
- **PDF**: jsPDF
- **QR Code**: qrcode

## 📦 Instalação

### Pré-requisitos

- Node.js 16+
- npm ou yarn

### Passos para instalação

1. **Clone o repositório**

   ```bash
   git clone <url-do-repositorio>
   cd autotrack
   ```

2. **Instale as dependências**

   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Execute a aplicação**

   ```bash
   npm start
   # ou
   yarn start
   ```

4. **Acesse a aplicação**
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## 🔐 Dados de Teste

Para testar a aplicação, use as seguintes credenciais:

**Usuário Pro (acesso completo):**

- Email: `joao@email.com`
- Senha: `123456`

**Usuário Avançado:**

- Email: `maria@email.com`
- Senha: `123456`

**Usuário Básico:**

- Email: `pedro@email.com`
- Senha: `123456`

## 📱 Funcionalidades Implementadas

### ✅ Autenticação

- [x] Página de login
- [x] Página de cadastro
- [x] Sistema de tipos de usuário
- [x] Contexto de autenticação
- [x] Proteção de rotas

### ✅ Dashboard

- [x] Resumo de estatísticas
- [x] Lista de veículos
- [x] Despesas recentes
- [x] Próximos pagamentos
- [x] Design responsivo

### ✅ Gestão de Veículos

- [x] Listagem de veículos
- [x] Cadastro de veículo
- [x] Edição de veículo
- [x] Exclusão de veículo
- [x] Upload de foto
- [x] Links rápidos para funcionalidades

### 🚧 Em Desenvolvimento

- [ ] Gestão de despesas
- [ ] Sistema de grupos
- [ ] Alertas de emergência
- [ ] Mapa de oficinas
- [ ] Painel administrativo
- [ ] Exportação PDF
- [ ] Compartilhamento
- [ ] Relatórios avançados

## 🎨 Design System

A aplicação utiliza um design system consistente baseado em:

- **Cores**: Paleta de azuis (primary) e cinzas (secondary)
- **Tipografia**: Inter (Google Fonts)
- **Componentes**: Botões, inputs, cards, modais reutilizáveis
- **Layout**: Mobile-first, responsivo
- **Ícones**: Lucide React (consistente e moderno)

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes de interface
│   └── layout/         # Componentes de layout
├── contexts/           # Contextos React (Auth, etc.)
├── data/              # Dados mockados
├── pages/             # Páginas da aplicação
│   ├── auth/          # Páginas de autenticação
│   └── ...            # Outras páginas
├── types/             # Definições TypeScript
├── App.tsx            # Componente principal
└── index.tsx          # Ponto de entrada
```

## 🔧 Scripts Disponíveis

- `npm start` - Executa a aplicação em modo de desenvolvimento
- `npm build` - Cria build de produção
- `npm test` - Executa os testes
- `npm run eject` - Ejecta do Create React App

## 🔗 Integração com Supabase

Esta aplicação pode se conectar ao Supabase para autenticação e persistência dos dados.

### Passo a passo

- Crie um projeto no [Supabase](https://supabase.com/).
- Copie o `Project URL` e a `Anon Key` do seu projeto.
- Crie um arquivo `.env.local` na raiz baseado em `.env.local.example`:
  ```env
  REACT_APP_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
  REACT_APP_SUPABASE_ANON_KEY=YOUR-ANON-KEY
  ```
- Execute o script `supabase/schema.sql` no editor SQL do Supabase para criar as tabelas e políticas de acesso.
- Reinicie a aplicação (`npm start`).

### Cliente Supabase

O cliente é inicializado em `src/lib/supabaseClient.ts`:

```ts
import { supabase } from './lib/supabaseClient'

async function exemplo() {
  const { data, error } = await supabase.from('vehicles').select('*').limit(1)
}
```

### Observações

- Em Create React App, variáveis de ambiente no frontend devem começar com `REACT_APP_`.
- As tabelas possuem RLS (Row Level Security) com políticas para garantir que cada usuário acesse apenas seus dados.
- O script cria um `profiles` sincronizado com `auth.users` via trigger, facilitando consultas no frontend.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato através de:

- Email: suporte@autotrack.com
- Issues no GitHub

---

**AutoTrack** - Gerencie seus veículos de forma inteligente! 🚗✨
