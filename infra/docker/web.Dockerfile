FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate

# ------ Deps + build ------
FROM base AS build
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY tsconfig.base.json ./
COPY apps/web ./apps/web
# Instala só o necessário para build da web
RUN pnpm install --filter ./apps/web...
RUN pnpm -C apps/web build

# ------ Runtime (produção) ------
FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate

# Metadados e pacotes para resolver o workspace da web
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/web/package.json ./apps/web/package.json

# Instala SOMENTE deps de produção da web (garante binário `next`)
RUN pnpm install --filter ./apps/web... --prod

# Copia o build
COPY --from=build /app/apps/web/.next ./apps/web/.next

WORKDIR /app/apps/web
EXPOSE 3000
CMD ["pnpm","start"]
