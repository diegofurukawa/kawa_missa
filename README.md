# 🕊️ Kawa Missa

> **Gestão Paroquial Simplificada** - Sistema completo de governança e liturgia para paróquias e comunidades religiosas

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.2-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-8.16-336791?logo=postgresql)](https://www.postgresql.org/)

---

## ✨ Por que escolher o Kawa Missa?

Gerencie sua paróquia de forma **moderna, eficiente e intuitiva**. O Kawa Missa foi desenvolvido especificamente para atender às necessidades das comunidades religiosas, oferecendo uma solução completa para:

- 📅 **Agendamento e gestão de missas** com controle de participantes
- 👥 **Gerenciamento de usuários** e permissões
- ⚙️ **Configurações personalizáveis** de cronograma e liturgia
- 🌐 **Dashboard público** para compartilhamento com fiéis
- 🏢 **Multi-tenant** - Suporte a múltiplas organizações

---

## 🚀 Funcionalidades Principais

### 📋 Gestão de Missas
- Criação e edição de missas com data e horário
- Sistema de participantes configurável por função litúrgica
- Visualização em carrossel das próximas missas
- URLs únicas (slugs) para cada missa

### 👤 Gestão de Organização
- Cadastro completo de paróquias/organizações
- Informações de contato e endereço
- Múltiplas configurações por organização
- Sistema de responsáveis

### ⚙️ Configurações Flexíveis
- Configuração de cronograma (cron jobs)
- Definição de participantes por função (leitores, acólitos, etc.)
- Múltiplas configurações por organização

### 🌍 Dashboard Público
- Visualização pública das próximas missas
- Compartilhamento fácil via link
- Interface responsiva e moderna

### 🔐 Segurança e Autenticação
- Autenticação segura com NextAuth
- Sistema de roles e permissões
- Proteção de rotas e dados

---

## 🛠️ Tecnologias

O Kawa Missa é construído com as melhores tecnologias modernas:

- **Framework**: [Next.js 16](https://nextjs.org/) - React com App Router
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/) - Type safety
- **Banco de Dados**: [PostgreSQL](https://www.postgresql.org/) - Banco relacional robusto
- **ORM**: [Prisma](https://www.prisma.io/) - Type-safe database access
- **Autenticação**: [NextAuth.js](https://next-auth.js.org/) - Autenticação completa
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/) - Design moderno e responsivo
- **Validação**: [Zod](https://zod.dev/) - Schema validation
- **UI Components**: Componentes customizados com Lucide Icons

---

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ 
- PostgreSQL
- Yarn ou npm

### Passo a passo

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/kawa_missa.git
   cd kawa_missa
   ```

2. **Instale as dependências**
   ```bash
   yarn install
   # ou
   npm install
   ```

3. **Configure as variáveis de ambiente**
   
   Crie um arquivo `.env` na raiz do projeto:
   ```env
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/kawa_missa"
   NEXTAUTH_SECRET="seu-secret-aqui"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Configure o banco de dados**
   ```bash
   yarn prisma migrate dev
   # ou
   npx prisma migrate dev
   ```

5. **Inicie o servidor de desenvolvimento**
   ```bash
   yarn dev
   # ou
   npm run dev
   ```

6. **Acesse a aplicação**
   
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 📖 Uso

### Primeiro Acesso

1. Acesse a página inicial e clique em **"Criar Conta"**
2. Complete o cadastro de usuário
3. Configure sua organização/paróquia
4. Comece a criar missas e gerenciar participantes!

### Funcionalidades Disponíveis

- **Dashboard**: Visualize as próximas missas e informações da organização
- **Masses**: Crie, edite e gerencie todas as missas agendadas
- **Config**: Configure cronogramas e participantes
- **Organization**: Gerencie os dados da sua paróquia

---

## 🏗️ Estrutura do Projeto

```
kawa_missa/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/        # Dashboard e páginas administrativas
│   ├── login/            # Página de login
│   └── onboarding/       # Onboarding de novos usuários
├── lib/                   # Utilitários e helpers
│   ├── actions.ts        # Server actions
│   ├── data.ts           # Funções de acesso a dados
│   └── prisma.ts         # Cliente Prisma
├── prisma/               # Schema e migrações do banco
│   └── schema.prisma     # Schema do banco de dados
└── app/ui/               # Componentes reutilizáveis
```

---

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
yarn dev          # Inicia servidor de desenvolvimento

# Build
yarn build        # Cria build de produção
yarn start        # Inicia servidor de produção

# Banco de dados
yarn prisma migrate dev    # Executa migrações
yarn prisma studio         # Abre Prisma Studio

# Linting
yarn lint         # Executa ESLint
```

---

## 🐳 Deployment com Docker

### Setup Inicial

1. **Crie a network Docker** (necessária para comunicação entre containers)
   ```bash
   docker network create kawatech-network
   ```

2. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   # Edite .env com suas configurações
   ```

3. **Execute o script de setup** (opcional, mas recomendado)
   ```bash
   chmod +x scripts/setup-docker.sh
   ./scripts/setup-docker.sh
   ```

### Variáveis de Ambiente Obrigatórias

```env
# Database
DATABASE_URL="postgresql://postgres:senha@host_database:5432/kawa_missa"
# OU use variáveis individuais:
DB_HOST=host_database
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=kawa_missa
DB_SSL=false

# Authentication
AUTH_SECRET=seu_secret_aleatorio_aqui
NEXTAUTH_SECRET=outro_secret_aleatorio
JWT_SECRET=mais_um_secret_aleatorio

# NextAuth
NEXTAUTH_URL=http://localhost:3115

# Push Notifications (opcional)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=sua_chave_publica
VAPID_PRIVATE_KEY=sua_chave_privada
VAPID_EMAIL=seu_email@example.com
```

### Gerar Secrets Seguros

```bash
# Gerar um secret aleatório seguro
openssl rand -base64 32
```

### Deploy com Docker Compose

```bash
# Iniciar containers
docker-compose up -d

# Ver logs
docker-compose logs -f kawa_missa

# Parar containers
docker-compose down

# Parar e remover volumes (cuidado!)
docker-compose down -v
```

### Verificar Status

```bash
# Listar containers
docker ps

# Acessar logs
docker logs kawa_missa

# Executar comando no container
docker exec kawa_missa npx prisma migrate status
```

### Troubleshooting

**Erro: Network não encontrada**
```bash
docker network create kawatech-network
```

**Erro: Conexão recusada ao banco**
- Verifique se `DB_HOST` está correto (use nome do serviço Docker, ex: `host_database`)
- Verifique se `DB_SSL` está configurado corretamente
- Confirme que o container do banco está rodando: `docker ps`

**Erro: Migrations falharam**
```bash
# Verificar status das migrations
docker exec kawa_missa npx prisma migrate status

# Limpar migrations falhadas (cuidado!)
docker exec kawa_missa npx prisma migrate resolve --rolled-back 20260220000000_migration_name
```

---

## 🧪 Testes

### Testes Unitários

```bash
# Executar testes uma vez
npm run test

# Modo watch
npm run test:watch

# Com cobertura
npm run test -- --coverage
```

### Testes E2E

```bash
# Executar testes E2E
npm run test:e2e

# Modo UI (interativo)
npm run test:e2e:ui

# Modo debug
npm run test:e2e -- --debug
```

---

## 🔐 Segurança

### Boas Práticas

1. **Nunca commite `.env`** - Use `.env.example` como template
2. **Gere secrets únicos** - Use `openssl rand -base64 32`
3. **Use HTTPS em produção** - Configure certificados SSL/TLS
4. **Mantenha dependências atualizadas** - Execute `npm audit` regularmente
5. **Configure rate limiting** - Proteja contra brute force
6. **Valide inputs** - Sempre valide dados do usuário com Zod

### Variáveis Críticas

Estas variáveis DEVEM estar configuradas:
- `AUTH_SECRET` - Secret para JWT
- `NEXTAUTH_SECRET` - Secret para NextAuth
- `JWT_SECRET` - Secret para tokens JWT
- `DATABASE_URL` ou `DB_HOST` - Conexão com banco

---



Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abrir um Pull Request

---

## 📝 Licença

Este projeto está sob a licença especificada no arquivo `LICENSE`.

---

## 🙏 Agradecimentos

Desenvolvido com dedicação para facilitar a gestão de comunidades religiosas e paróquias.

---

## 📞 Suporte

Para dúvidas, sugestões ou problemas, abra uma [issue](https://github.com/seu-usuario/kawa_missa/issues) no repositório.

---

<div align="center">

**Feito com ❤️ para comunidades religiosas**

[⭐ Dê uma estrela](https://github.com/seu-usuario/kawa_missa) se este projeto foi útil!

</div>
