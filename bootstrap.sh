#!/usr/bin/env bash
set -euo pipefail

echo "==> Criando estrutura de pastas..."
mkdir -p apps/api/src/controllers
mkdir -p apps/web/src/app
mkdir -p packages/core/src
mkdir -p packages/ui/src
mkdir -p infra/docker
mkdir -p infra/db/migrations
mkdir -p infra/db/seeds
mkdir -p .github/workflows
mkdir -p docs

echo "==> Arquivos raiz..."
cat > package.json <<'JSON'
{
  "name": "chashier-monorepo",
  "private": true,
  "packageManager": "pnpm@9.4.0",
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck"
  },
  "devDependencies": {
    "@commitlint/cli": "19.3.0",
    "@commitlint/config-conventional": "19.2.2",
    "eslint": "9.7.0",
    "prettier": "3.3.3",
    "turbo": "2.0.5",
    "typescript": "5.5.4"
  }
}
JSON

cat > pnpm-workspace.yaml <<'YAML'
packages:
  - "apps/*"
  - "packages/*"
YAML

cat > turbo.json <<'JSON'
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**"] },
    "dev": { "cache": false },
    "lint": {},
    "test": {},
    "typecheck": {}
  }
}
JSON

cat > .gitignore <<'TXT'
node_modules
dist
.next
.env
.env.*
.DS_Store
pnpm-lock.yaml
TXT

cat > .env.example <<'ENV'
TZ=America/Sao_Paulo
API_URL=http://localhost:4000
WEB_URL=http://localhost:3000
JWT_ACCESS_SECRET=replace_me_access
JWT_REFRESH_SECRET=replace_me_refresh
FIELD_ENCRYPTION_KEY_BASE64=replace_with_32_bytes_key_base64
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=chashier
POSTGRES_USER=chashier
POSTGRES_PASSWORD=chashier
REDIS_HOST=redis
REDIS_PORT=6379
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=chashier
SMTP_HOST=smtp-relay.gmail.com
SMTP_PORT=587
SMTP_USER=financeiro@cupcode.com.br
SMTP_PASS=app_password_or_relay
SMTP_FROM="Cupcode Financeiro" <financeiro@cupcode.com.br>
PROVIDER_CARD=stripe
PROVIDER_PIX=local
FEATURE_SMS=false
FEATURE_WHATSAPP=true
ENV

cat > README.md <<'MD'
# Cupcode Cha$hier — Monorepo (bootstrap)
Para rodar local:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
docker compose -f infra/docker/docker-compose.yml up -d --build
MD

echo "==> Infra (Docker Compose + Dockerfiles)..."
cat > infra/docker/docker-compose.yml <<'YAML'
version: "3.9"
services:
postgres:
image: postgres:16
environment:
POSTGRES_DB: chashier
POSTGRES_USER: chashier
POSTGRES_PASSWORD: chashier
ports: ["5432:5432"]
healthcheck:
test: ["CMD-SHELL", "pg_isready -U chashier"]
interval: 5s
timeout: 5s
retries: 20
redis:
image: redis:7
ports: ["6379:6379"]
minio:
image: minio/minio:RELEASE.2024-08-17T01-24-54Z
command: server /data --console-address ":9001"
environment:
MINIO_ROOT_USER: ${MINIO_ACCESS_KEY:minioadmin}
MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY:minioadmin}
ports: ["9000:9000","9001:9001"]
api:
build:
context: ../..
dockerfile: infra/docker/api.Dockerfile
env_file:
- ../../apps/api/.env
ports: ["4000:4000"]
depends_on:
postgres:
condition: service_healthy
redis:
condition: service_started
command: ["pnpm","start:docker"]
web:
build:
context: ../..
dockerfile: infra/docker/web.Dockerfile
env_file:
- ../../apps/web/.env
ports: ["3000:3000"]
depends_on:
- api
YAML

cat > infra/docker/api.Dockerfile <<'DOCKER'
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/
COPY packages ./packages
RUN pnpm install --filter ./apps/api...

FROM deps AS build
COPY tsconfig.base.json ./ || true
COPY apps/api ./apps/api
RUN pnpm -C apps/api build

FROM base AS run
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate
COPY --from=build /app/apps/api/dist /app/apps/api/dist
COPY apps/api/package.json apps/api/pnpm-lock.yaml apps/api/.env /app/apps/api/
WORKDIR /app/apps/api
EXPOSE 4000
CMD ["pnpm","start:prod"]
DOCKER

cat > infra/docker/web.Dockerfile <<'DOCKER'
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json apps/web/
COPY packages ./packages
RUN pnpm install --filter ./apps/web...

FROM deps AS build
COPY tsconfig.base.json ./ || true
COPY apps/web ./apps/web
RUN pnpm -C apps/web build

FROM base AS run
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate
COPY --from=build /app/apps/web/.next /app/apps/web/.next
COPY apps/web/package.json apps/web/pnpm-lock.yaml apps/web/.env /app/apps/web/
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["pnpm","start"]
DOCKER

echo "==> packages/core mínimo..."
cat > packages/core/package.json <<'JSON'
{
"name": "@chashier/core",
"version": "0.0.1",
"main": "dist/index.js",
"types": "dist/index.d.ts",
"scripts": { "build": "tsc -p tsconfig.json" },
"devDependencies": { "typescript": "5.5.4" }
}
JSON

cat > packages/core/tsconfig.json <<'JSON'
{
"extends": "../../tsconfig.base.json",
"compilerOptions": { "outDir": "dist" },
"include": ["src"]
}
JSON

cat > packages/core/src/index.ts <<'TS'
export const hello = () => "core-ok";
TS

echo "==> tsconfig base..."
cat > tsconfig.base.json <<'JSON'
{
"compilerOptions": {
"target": "ES2020",
"module": "commonjs",
"strict": true,
"esModuleInterop": true,
"skipLibCheck": true
}
}
JSON

echo "==> API (NestJS mínima, com Swagger e Health)..."
cat > apps/api/package.json <<'JSON'
{
"name": "api",
"private": true,
"scripts": {
"dev": "nest start --watch",
"build": "nest build",
"start": "nest start",
"start:prod": "node dist/main.js",
"start:docker": "node dist/main.js"
},
"dependencies": {
"@nestjs/common": "10.4.5",
"@nestjs/core": "10.4.5",
"@nestjs/platform-express": "10.4.5",
"@nestjs/swagger": "7.4.2",
"@nestjs/config": "3.2.2",
"class-validator": "0.14.1",
"class-transformer": "0.5.1",
"reflect-metadata": "0.1.13",
"rxjs": "7.8.1",
"swagger-ui-express": "5.0.1"
},
"devDependencies": {
"@nestjs/cli": "10.4.5",
"@nestjs/schematics": "10.1.2",
"@nestjs/testing": "10.4.5",
"typescript": "5.5.4"
}
}
JSON

cat > apps/api/.env.example <<'ENV'
PORT=4000
CORS_ALLOWLIST=http://localhost:3000
ENV

cat > apps/api/nest-cli.json <<'JSON'
{ "collection": "@nestjs/schematics", "sourceRoot": "src" }
JSON

cat > apps/api/tsconfig.json <<'JSON'
{
"compilerOptions": {
"module": "commonjs",
"declaration": true,
"removeComments": true,
"emitDecoratorMetadata": true,
"experimentalDecorators": true,
"allowJs": false,
"target": "ES2020",
"sourceMap": true,
"outDir": "./dist",
"incremental": true
}
}
JSON

cat > apps/api/src/main.ts <<'TS'
import { NestFactory } from '@nestjs/core';
import { AppModule } from './module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
const app = await NestFactory.create(AppModule, { logger: ['log','error','warn'] });
app.enableCors({ origin: (process.env.CORS_ALLOWLIST||'').split(',').filter(Boolean) });

const config = new DocumentBuilder().setTitle('Cha$hier API').setVersion('0.0.1').build();
const doc = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, doc);

await app.listen(process.env.PORT || 4000);
}
bootstrap();
TS

cat > apps/api/src/module.ts <<'TS'
import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';

@Module({ controllers: [AppController] })
export class AppModule {}
TS

cat > apps/api/src/controllers/app.controller.ts <<'TS'
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
@Get('/health')
health() { return { ok: true, ts: new Date().toISOString() }; }
}
TS

echo "==> WEB (Next.js 14 App Router mínima)..."
cat > apps/web/package.json <<'JSON'
{
"name": "web",
"private": true,
"scripts": {
"dev": "next dev -p 3000",
"build": "next build",
"start": "next start -p 3000"
},
"dependencies": {
"next": "14.2.5",
"react": "18.3.1",
"react-dom": "18.3.1"
}
}
JSON

cat > apps/web/tsconfig.json <<'JSON'
{
"compilerOptions": {
"target": "ES2020",
"lib": ["dom", "dom.iterable", "esnext"],
"allowJs": false,
"skipLibCheck": true,
"strict": true,
"noEmit": true,
"module": "esnext",
"moduleResolution": "bundler",
"resolveJsonModule": true,
"isolatedModules": true,
"jsx": "preserve",
"incremental": true
},
"include": ["next-env.d.ts", "src//*", ".next/types//*.ts"],
"exclude": ["node_modules"]
}
JSON

cat > apps/web/next.config.mjs <<'JS'
/** @type {import('next').NextConfig} */
const nextConfig = { reactStrictMode: true, experimental: { appDir: true } };
export default nextConfig;
JS

cat > apps/web/src/app/layout.tsx <<'TSX'
export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="pt-BR">
<body style={{background:'#0f0f14',color:'#fff',fontFamily:'ui-sans-serif,system-ui'}}>
{children}
</body>
</html>
);
}
TSX

cat > apps/web/src/app/page.tsx <<'TSX'
export default function Home() {
return (
<main style={{padding:24}}>
<h1 style={{fontSize:28, fontWeight:700}}>Cupcode Cha$hier</h1>
<p style={{opacity:.8}}>Monorepo inicial pronto. API em <code>http://localhost:4000/docs</code>.</p>
</main>
);
}
TSX

cat > apps/web/.env.example <<'ENV'
NEXT_PUBLIC_API_URL=http://localhost:4000
ENV

echo "==> Pronto. Copie os .env e suba com Docker Compose."
