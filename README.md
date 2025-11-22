# Stock Control App

Bem-vindo ao Stock Control App!

Este projeto é um sistema moderno para controle de estoque, vendas e relatórios, pensado para ser simples, visual e eficiente. Aqui você pode cadastrar produtos, acompanhar movimentações, analisar vendas e extrair insights do seu negócio.

## Principais Funcionalidades
- Cadastro e gestão de produtos e categorias
- Controle de entradas e saídas de estoque
- Relatórios visuais com KPIs, gráficos e tabelas
- Dashboard intuitivo e responsivo
- Integração com Supabase para dados reais

## Como rodar o projeto
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure o arquivo `.env` com suas credenciais do Supabase.
3. Inicie o projeto:
   ```bash
   npm run dev
   ```

## Sobre
Este projeto foi desenvolvido com foco em clareza, experiência do usuário e código limpo. Sinta-se à vontade para contribuir ou adaptar para sua realidade!

---

Desenvolvido por Pedro Mendes e colaboradores.# StockControl

Sistema de controle de estoque desenvolvido para gerenciar produtos, categorias, fornecedores e movimentações de estoque.

## 🚀 Como começar

### Pré-requisitos

- Node.js 18 ou superior
- npm 9 ou superior
- Conta no Supabase (para banco de dados)

### Instalação

1. Clone o repositório e entre na pasta do projeto:
```bash
cd stock_control_app
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente criando um arquivo `.env` na raiz do projeto:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
VITE_IDLE_TIMEOUT_MINUTES=30
```

4. Execute o projeto em modo de desenvolvimento:
```bash
npm run dev
```

5. Acesse `http://localhost:5173` no navegador

## 📦 Scripts disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera a build de produção
- `npm run preview` - Visualiza a build de produção
- `npm run lint` - Executa o linter
- `npm run typecheck` - Verifica erros de TypeScript

## 🗄️ Banco de Dados

O projeto usa Supabase como backend. Para configurar o banco:

1. Execute o script SQL em `supabase_schema.sql` no SQL Editor do Supabase
2. (Opcional) Execute `sql/seed_real_data.sql` para popular com dados de exemplo

## 🎯 Funcionalidades

- ✅ Autenticação com email/senha e login social (Google/GitHub)
- ✅ Cadastro e gerenciamento de produtos
- ✅ Controle de categorias e fornecedores
- ✅ Movimentações de estoque (entrada/saída)
- ✅ Dashboard com indicadores
- ✅ Relatórios e exportação de dados
- ✅ Interface responsiva

## 🛠️ Tecnologias

- **Frontend**: React 19 + TypeScript + Vite
- **Estilização**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth)
- **Estado**: TanStack Query (React Query)
- **Validação**: Zod + React Hook Form

## 📁 Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── features/       # Funcionalidades organizadas por domínio
├── pages/          # Páginas principais
├── hooks/          # Hooks customizados
├── services/       # Camada de API
├── contexts/       # Contextos React
└── lib/            # Utilitários
```

## 📝 Notas

Este é um projeto acadêmico desenvolvido para a disciplina A3.

Para dúvidas ou problemas, verifique a documentação do Supabase ou entre em contato.
