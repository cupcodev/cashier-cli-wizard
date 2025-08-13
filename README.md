# Cupcode Cha\$hier — Monorepo

Bem-vindo ao **Cupcode Cha\$hier**, um monorepo que concentra **API (NestJS + TypeORM)**, **Frontend (Next.js App Router)**, **pacotes compartilhados** e **infra**. O objetivo do Cha\$hier é oferecer uma base sólida para um **CRM/Financeiro** com **clientes, faturas, assinaturas, pagamentos** e **auditoria** — pronto para evoluir para SaaS/white‑label.

> **Aviso**: este README reflete a estrutura enviada até agora. Onde houver variações locais (scripts/ambientes), marque com *TODO* e ajuste conforme sua configuração real.

---

## Sumário

* [Arquitetura & Stack](#arquitetura--stack)
* [Estrutura do Monorepo](#estrutura-do-monorepo)
* [Pré-requisitos](#pré-requisitos)
* [Primeiros Passos (Local)](#primeiros-passos-local)

  * [Opção A — Docker Compose](#opção-a--docker-compose)
  * [Opção B — Postgres gerenciado / Supabase](#opção-b--postgres-gerenciado--supabase)
* [Variáveis de Ambiente](#variáveis-de-ambiente)
* [Scripts & Convenções](#scripts--convenções)
* [API (NestJS)](#api-nestjs)

  * [Módulos & Entidades](#módulos--entidades)
  * [Migrations & Seed](#migrations--seed)
  * [Autenticação & Segurança](#autenticação--segurança)
* [Frontend (Next.js App Router)](#frontend-nextjs-app-router)

  * [Rotas Principais](#rotas-principais)
  * [Chamadas à API](#chamadas-à-api)
* [Pacotes Compartilhados](#pacotes-compartilhados)
* [Pipelines (Turbo/Nx) & CI](#pipelines-turbonx--ci)
* [Boas Práticas](#boas-práticas)
* [Troubleshooting (Pitfalls comuns)](#troubleshooting-pitfalls-comuns)
* [Roadmap](#roadmap)
* [Licença](#licença)

---

## Arquitetura & Stack

**Monorepo** com *workspaces* (pnpm) e orquestração via **Turborepo** (`turbo.json`).

* **API**: [NestJS](https://nestjs.com/) + [TypeORM](https://typeorm.io/)

  * Domínios já mapeados: `customers`, `invoices`, `subscriptions`, `payments`, `audit-log`.
  * CLI para migrations/rollback em `apps/api/src/cli`.
* **Frontend**: [Next.js (App Router)](https://nextjs.org/) (`apps/web`)

  * Páginas administrativas sob `/admin`.
  * Route Handlers em `src/app/api/**` quando necessário.
* **Pacotes**: `packages/core` (tipos/utilidades), `packages/ui` (componentes compartilhados).
* **Infra**: `infra/docker` (Dockerfiles + `docker-compose.yml`), `infra/db` (migrations/seeds auxiliares, se usados).

> **Banco de dados**: Postgres. Você pode executar via **Docker Compose** (local) ou apontar para um **Postgres gerenciado** (ex.: Supabase). A escolha influencia apenas as variáveis de ambiente de conexão.

---

## Estrutura do Monorepo

```
/
├─ apps/
│  ├─ api/                  # NestJS API
│  │  ├─ src/
│  │  │  ├─ auth/           # guards, module, service, dto
│  │  │  ├─ controllers/    # app, customers, invoices, ops
│  │  │  ├─ database/       # data-source/config (TypeORM)
│  │  │  ├─ dtos/
│  │  │  ├─ entities/       # customer, invoice, payment, package, subscription, audit-log, etc.
│  │  │  ├─ migrations/     # 1700..., 20250811190000-...
│  │  │  ├─ modules/
│  │  │  ├─ schemas/        # zod helpers e schemas (se usados)
│  │  │  ├─ seed/
│  │  │  ├─ cli/            # migrate.ts / revert.ts
│  │  │  ├─ main.ts / module.ts
│  │  ├─ package.json / tsconfig.json / nest-cli.json
│  └─ web/                  # Next.js (App Router)
│     ├─ src/app/admin/...  # customers, invoices, finance
│     ├─ src/app/api/...    # route handlers
│     ├─ src/app/login
│     ├─ src/layout.tsx / src/page.tsx / src/providers.tsx
│     ├─ next.config.mjs / tsconfig.json / package.json
├─ packages/
│  ├─ core/                 # tipos/utilidades compartilhadas
│  └─ ui/                   # componentes compartilhados
├─ infra/
│  ├─ docker/               # api.Dockerfile, web.Dockerfile, docker-compose.yml
│  └─ db/                   # migrations/seeds (opcional)
├─ docs/                    # documentação adicional (opcional)
├─ turbo.json               # pipeline do Turborepo
├─ pnpm-workspace.yaml      # workspaces
├─ package.json             # scripts da raiz
├─ tsconfig.base.json       # base TS para workspaces
└─ .env(.example)           # variáveis da raiz (quando aplicável)
```

---

## Pré-requisitos

* **Node.js** 20.x (LTS)
* **pnpm** 9.x
* **Docker** e **Docker Compose** (para a opção A)
  *ou* acesso a um **Postgres gerenciado** (ex.: Supabase) para a opção B

> Verifique as versões: `node -v`, `pnpm -v`, `docker -v`. Ajuste conforme seu ambiente.

---

## Primeiros Passos (Local)

### Opção A — Docker Compose

1. **Instalar dependências** na raiz do monorepo:

```bash
pnpm install --frozen-lockfile
```

2. **Copiar variáveis de ambiente** (sem segredos):

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

3. **Subir infraestrutura** (Postgres, etc.):

```bash
docker compose -f infra/docker/docker-compose.yml up -d --build
```

4. **Build do monorepo** (opcional, se scripts já existirem):

```bash
pnpm -w build
```

5. **Rodar API e Web em paralelo** (ajuste aos scripts reais do projeto):

```bash
# exemplos comuns — verifique os scripts em apps/api e apps/web
pnpm -F api start:dev    # NestJS em modo watch
pnpm -F web dev          # Next.js em modo dev
```

6. **Executar migrations** (após a API conhecer o DB):

```bash
# escolha a abordagem existente no package.json da API
pnpm -F api migrate           # se houver script
# ou, via ts-node/CLI custom
pnpm -F api ts-node src/cli/migrate.ts
```

> Para reverter:

```bash
pnpm -F api revert
# ou
pnpm -F api ts-node src/cli/revert.ts
```

### Opção B — Postgres gerenciado / Supabase

1. **Crie o banco** (Supabase/Cloud Postgres) e obtenha `DATABASE_URL` (ou host/porta/usuario/senha/db).
2. **Preencha `apps/api/.env`** com as credenciais do banco.
3. **Se usar Supabase no Frontend**: defina `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` em `apps/web/.env`.
4. **Rode migrations** conforme a seção da API.
5. **Inicie API e Web** com `pnpm -F api start:dev` e `pnpm -F web dev`.

> **Importante**: **nunca** exponha `SUPABASE_SERVICE_ROLE_KEY` no frontend. Caso a API precise, mantenha essa chave **apenas** em ambiente de servidor.

---

## Variáveis de Ambiente

> Use os arquivos `*.env.example` como base. **Não** commite segredos.

### Raiz (`.env`)

Pode centralizar chaves compartilhadas (ex.: modo de execução, toggles de monorepo). Campos comuns:

```
# exemplo — ajuste ao seu projeto real
NODE_ENV=development
```

### API — `apps/api/.env`

```
# Servidor
PORT=4000
CORS_ALLOWLIST=http://localhost:3000

# Banco de dados (escolha um formato)
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=cashier
# ou URL completa (preferido)
DATABASE_URL=postgres://user:pass@host:5432/dbname

# Auth (exemplos)
JWT_SECRET=changeme
JWT_EXPIRES_IN=1d
```

### Web — `apps/web/.env`

```
# Base da API Nest (quando o frontend consome a API diretamente)
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

# Supabase (se usado no frontend)
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key
```

---

## Scripts & Convenções

Na raiz do monorepo (exemplos sugeridos):

```json
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "clean": "turbo run clean"
  }
}
```

Na API (`apps/api/package.json`) — exemplos usuais:

```json
{
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "build": "nest build",
    "migrate": "ts-node src/cli/migrate.ts",
    "revert": "ts-node src/cli/revert.ts",
    "lint": "eslint \"src/**/*.ts\"",
    "test": "jest"
  }
}
```

Na Web (`apps/web/package.json`) — exemplos usuais:

```json
{
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint"
  }
}
```

> Ajuste os scripts **conforme o que já existe** no seu projeto. Se algo estiver faltando, adote estes como padrão.

---

## API (NestJS)

### Módulos & Entidades

* `src/controllers`: `app.controller.ts`, `customers.controller.ts`, `invoices.controller.ts`, `ops.controller.ts`.
* `src/services`: `customers.service.ts` (e semelhantes por domínio).
* `src/entities`: `customer`, `invoice`, `payment`, `package`, `subscription`, `audit-log` e entidades relacionadas (ex.: `customer.address`, `customer.contact`).
* `src/auth`: `auth.module.ts`, `auth.service.ts`, `auth.guard.ts`, `jwt.guard.ts`, `auth.dto.ts`.
* `src/module.ts`: módulo raiz (importa submódulos e configurações).

> **Atenção**: mantenha **apenas um** diretório oficial de `entities/` e `migrations/` por aplicação. Pastas duplicadas tendem a gerar erros do TypeORM como *"Entity metadata for X was not found"*.

### Migrations & Seed

* CLI em `src/cli/migrate.ts` e `src/cli/revert.ts`.
* Seeds em `src/seed/seed.ts` (se aplicável ao ambiente dev).

**Boas práticas**:

* Versione migrations (sem alterar migrations antigas já aplicadas em produção).
* Evite lógica de dados irreversível dentro de migrations.

### Autenticação & Segurança

* Guards JWT em `src/auth`.
* Configure `CORS_ALLOWLIST` na API para limitar origens.
* Utilize DTOs com validação (`class-validator`) para sanitizar entrada.
* Registre interceptors/filters globais em `main.ts` (ex.: `ValidationPipe`, `Logger`, `ExceptionFilter`).

---

## Frontend (Next.js App Router)

### Rotas Principais

* `/admin/customers` e `/admin/customers/[id]/edit`
* `/admin/invoices` e `/admin/invoices/[id]`
* `/admin/finance`
* `/login`

### Chamadas à API

* **Recomendado**: use `NEXT_PUBLIC_API_BASE_URL` para construir URLs absolutas, evitando problemas de `URL()` sem base.
* Em **Server Components**/Route Handlers, prefira `fetch(absoluteUrl, { cache: 'no-store' })` quando necessário (consistência de dados).
* Para evitar duplicações/efeitos em dev, considere cache/controlar revalidação adequadamente.

---

## Pacotes Compartilhados

* `packages/core`: tipos/utilitários; garanta *exports* e *types* corretos no `package.json`.
* `packages/ui`: componentes compartilhados; documente dependências (ex.: Tailwind/Shadcn, se utilizados).

> Defina regras de import (ESLint) para evitar dependências cruzadas indesejadas.

---

## Pipelines (Turbo/Nx) & CI

* **Turborepo** (`turbo.json`) orquestra `build`, `dev`, `lint`, `test` por projeto com cache incremental.
* **CI** (ex.: GitHub Actions) pode executar `pnpm install`, `pnpm -w build`, testes e *lint*.
* Use *path filters* (somente o que mudou) para reduzir tempo de pipeline.

> Se ainda não houver CI, adicione uma workflow mínima: *install → build → test → lint*.

---

## Boas Práticas

* **Fronteiras claras** entre `apps` e `packages` (evite imports cíclicos).
* **Padronização**: ESLint + Prettier + EditorConfig.
* **Env sem segredos** no repositório (somente `*.example`).
* **Documentação por domínio**: README curto em cada pasta crítica.
* **Logs & Auditoria**: utilize `audit-log` para rastrear ações sensíveis.

---

## Troubleshooting (Pitfalls comuns)

### 1) *Entity metadata for X was not found*

Causas comuns:

* Pastas **duplicadas** de `entities/` e `migrations/` ou *globs* incorretos.
* `TypeOrmModule.forFeature([...])` sem incluir a entidade.
* Caminhos compilados (`dist/**`) divergentes.

**Ações**:

* Unificar diretórios de entidades e ajustar `data-source`/`ormconfig`.
* Conferir *globs* (ex.: `join(__dirname, '../entities/**/*.entity.{ts,js}')`).
* Garantir que `module.ts` importe o módulo que registra as entidades.

### 2) Duplicação de dados no `customers` (lista)

Causas possíveis:

* **JOINs** One‑To‑Many sem `DISTINCT`/`GROUP BY` no SQL gerado.
* Renderização dupla em **React Strict Mode** no dev (efeitos/idempotência).

**Ações (API)**:

* Preferir `find({ relations, relationLoadStrategy: 'join', withDeleted: false })` com `loadRelationIds` quando só precisar de IDs.
* Para queries custom: `createQueryBuilder().leftJoinAndSelect(...).distinct(true)`.

**Ações (Web)**:

* Evitar *double fetch*; garanta uma única fonte de dados.
* Em RSC, usar `cache: 'no-store'` quando precisar do dado cru e evitar cache duplicado.

### 3) `TypeError: Failed to parse URL from undefined/...`

Causas:

* Construção de URL sem base (`new URL('/path')`).
* Variável `NEXT_PUBLIC_API_BASE_URL` ausente.

**Ações**:

* Sempre construir `new URL('/path', process.env.NEXT_PUBLIC_API_BASE_URL)` no **servidor**.
* No **cliente**, use `fetch('/api/...')` quando o handler é local ao Next; ou use `NEXT_PUBLIC_API_BASE_URL` para a API externa.

---

## Roadmap

* [ ] Unificar diretórios de `entities`/`migrations` na API.
* [ ] Padronizar scripts (`dev`, `build`, `migrate`, `revert`) em todos os pacotes.
* [ ] Adicionar testes de integração para `customers` e `invoices`.
* [ ] Configurar CI básico (GitHub Actions) com cache de pnpm/Turbo.
* [ ] Definir política de retenção de logs/PII (LGPD) e documentar no repositório.

Roadmap — Cupcode Cha$hier (proposta técnica)
Plano por marcos (M0–M14), cada um com objetivos, entregas/critérios de aceite, dependências e riscos. Ajuste a ordem conforme prioridades do negócio.

M0 — Fundamentos do monorepo
Objetivos

Workspaces (pnpm), Turborepo, TypeScript base, Docker Compose, scripts padrão.

.env.example em raiz, API e Web.

Entregas / critérios de aceite

pnpm -w build e pnpm -w dev funcionam.

Compose sobe serviços locais (DB, etc.) sem erro.

Riscos: divergência de versões Node/pnpm.
Mitigação: engines no package.json, .nvmrc.

M1 — Modelo de dados unificado & migrations
Objetivos

Unificar um único diretório oficial de entities/ e migrations/ em apps/api.

Normalizar: Customer, CustomerContact, CustomerAddress, Invoice, Payment, Package, Subscription, AuditLog.

Seed mínimo para dev.

Entregas / critérios de aceite

pnpm -F api migrate aplica e revert funciona.

FKs/índices definidos; migrations idempotentes.

Dependências: M0.
Riscos: legado divergente.
Mitigação: migration de “merge” testada em dump local.

M2 — API v1 (CRUD + Auth + Swagger)
Objetivos

Endpoints REST para customers, invoices, subscriptions, payments.

DTOs com validação (class-validator), ValidationPipe global.

Auth JWT (login; refresh opcional), RBAC simples.

Swagger/OpenAPI em dev e exportável.

Entregas / critérios de aceite

Listar/paginar/filtrar/ordenar clientes e faturas.

CORS respeita CORS_ALLOWLIST.

Dependências: M1.
Riscos: “Entity metadata not found” por globs.
Mitigação: revisar data-source e imports; testes de integração.

M3 — Admin Web v1 (Customers/Invoices/Finance)
Objetivos

Rotas: /admin/customers, /admin/customers/[id]/edit, /admin/invoices, /admin/invoices/[id], /admin/finance.

Guardas nos loaders/handlers para evitar quebras.

Fonte única de dados; evitar duplicações em listas.

Entregas / critérios de aceite

Fluxo ver/editar/salvar cliente sem erro de URL/base.

Lista de clientes sem registros quadruplicados.

Tratamento de erros com UX adequada.

Dependências: M2.
Riscos: duplicidade por Strict Mode/efeitos.
Mitigação: idempotência; cache: 'no-store' quando necessário.

M4 — Engine de faturamento
Objetivos

Faturas com itens; flags/valores para retenções manuais (INSS/IRRF/ISS) nesta fase.

Juros/multa pós-vencimento configuráveis.

Template PDF/HTML de fatura.

Entregas / critérios de aceite

Rascunho → emissão → cancelamento.

Audit-log de alterações.

Dependências: M3.
Riscos: arredondamentos fiscais.
Mitigação: centralizar utilitários de cálculo + testes.

M5 — Pagamentos (PIX + Cartão via adaptadores)
Objetivos

Abstração de gateway (adapter): escolha 1 provedor para MVP (ex.: Pagar.me, Stripe, Mercado Pago).

PIX via provedor/gateway; webhooks de confirmação.

Dunning básico (lembretes/reenvio).

Entregas / critérios de aceite

Webhooks validados; idempotência.

Status da fatura muda conforme eventos.

Dependências: M4.
Riscos: reconciliação de webhooks.
Mitigação: tabela de idempotência; assinatura/secret verificados.

M6 — Notificações (E-mail, SMS, WhatsApp Cloud API)
Objetivos

Camada de notificação com templates versionados.

SMTP, provedor de SMS, WhatsApp Cloud API (opt-in e conformidade).

Entregas / critérios de aceite

Envio transacional em emissão/baixa de fatura.

Logs de entrega e retries exponenciais; opt-out por canal.

Dependências: M4–M5.
Riscos: políticas Meta/WhatsApp.
Mitigação: verificação de remetente, certificados, webhooks.

M7 — LGPD, auditoria & retenção
Objetivos

audit-log em ações críticas (CRUD sensível, emissão, baixa, acessos).

Políticas de retenção: PII 5 anos e logs 10 anos (parâmetros ajustáveis).

Exportabilidade/anonymize sob solicitação.

Entregas / critérios de aceite

Rotas de export e deleção/anonymize com trilha de auditoria.

Matriz de dados sensíveis por entidade/campo.

Dependências: M2–M4.
Riscos: coleta excessiva de PII.
Mitigação: privacy by design; minimização.

M8 — Multitenancy & white-label
Objetivos

Estratégia de tenant: coluna tenant_id (por app/db) ou schema por tenant (decisão registrada em ADR).

Theming/branding por cliente; domínio customizado.

Rate-limit por tenant/usuário.

Entregas / critérios de aceite

Isolamento completo por tenant (queries e UI).

Troca de tema sem redeploy.

Dependências: M2–M6.
Riscos: vazamento entre tenants.
Mitigação: guardas por tenant_id; testes multi-tenant.

M9 — Observabilidade & SLOs
Objetivos

Logs estruturados, métricas e tracing (OpenTelemetry).

Dashboards e alertas (latência, erro, fila de jobs).

Entregas / critérios de aceite

SLOs definidos (ex.: p95 < 300 ms endpoints críticos).

Painéis operacionais e alertas ativos.

Dependências: M2–M3.
Riscos: ruído de alertas.
Mitigação: tuning e agregações.

M10 — Segurança aplicada
Objetivos

Headers (CSP, HSTS), CORS estrito, rate-limit.

Gestão de segredos por ambiente (CI/Cloud).

Scans SCA/SAST e atualizações de dependências.

Entregas / critérios de aceite

Checks de segurança passam no CI.

Sem chaves no repositório.

Dependências: M2–M6.
Riscos: exposição de secrets.
Mitigação: secret scanning e políticas de commit.

M11 — Performance & escala
Objetivos

Índices para consultas críticas; eliminação de N+1; caching onde aplicável.

Teste de carga nas rotas de listagem/emissão.

Entregas / critérios de aceite

p95 dentro dos SLOs.

Uso de CPU/IO/db em níveis aceitáveis sob carga.

Dependências: M2–M3.
Riscos: hot spots no DB.
Mitigação: leitura replicada/particionamento conforme necessidade.

M12 — SDK/Client & documentação
Objetivos

packages/core: cliente HTTP tipado (fetch wrapper) + tipos públicos.

Publicar OpenAPI e exemplos de uso.

Entregas / critérios de aceite

Exemplos funcionam contra ambientes dev/stage.

Versionamento semântico e changesets.

Dependências: M2.
Riscos: quebras frequentes.
Mitigação: políticas de versionamento e deprecação.

M13 — Release 1.0 (MVP GA)
Conteúdo mínimo

M1–M6 + M7 (básico), observabilidade mínima, segurança mínima, documentação de setup e operação.

Critérios de aceite

Fluxo ponta a ponta: criar cliente → emitir fatura → pagar (PIX/cartão) → confirmar via webhook → notificar → registrar audit-log.

Guia de implantação e runbook de incidentes.

M14 — Pós-GA / evolução
Possíveis extensões

Analytics (MRR, churn, aging, recebíveis).

Dunning avançado (regras por faixa/horário/canal).

Portal do cliente final (2ª via, histórico, notas).

Precificação por volume/usuário/tenant.

Integrações (contabilidade/ERP).

Matriz de dependências (resumo)
M0 → M1 → M2 → (M3, M4) → M5 → M6 → M8 → M13

M2 → M9/M10/M11/M12 (paralelizáveis)

Definition of Done (geral)
Lint/testes passando; migrations idempotentes; observabilidade mínima; documentação atualizada; feature flags quando aplicável.

Riscos principais & mitigação
Entidades/migrations duplicadas → Unificar diretórios e globs (M1).

Webhooks → Idempotência + verificação de assinatura (M5).

Vazamento de PII → Minimização + revisão de campos sensíveis (M7/M10).

Duplicação em listas → DISTINCT/normalização + fonte única de dados (M3/M2).

---

## Licença

**Proprietário (© Cupcode, 2025).** Uso interno e clientes autorizados. Não distribuir sem permissão.

---

### Anexo: Comandos rápidos

```bash
# instalar deps
pnpm install

# subir stack via docker
docker compose -f infra/docker/docker-compose.yml up -d --build

# rodar API e Web (ajuste aos scripts existentes)
pnpm -F api start:dev
pnpm -F web dev

# migrations (ajuste ao script existente)
pnpm -F api migrate
```

> Dúvidas/ajustes? Atualize este README conforme novos módulos e fluxos forem adicionados. Mantenha-o como a **fonte de verdade** do projeto. ☕

[Atualizaremos esse projeto para Supabase, em breve.]