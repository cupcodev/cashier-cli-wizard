FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate

# ------ Deps + build ------
FROM base AS build
# Metadados do workspace e pacotes necessários para resolver workspaces
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
# API fonte e build
COPY tsconfig.base.json ./
COPY apps/api ./apps/api
# Instala só o necessário para build da API
RUN pnpm install --filter ./apps/api...
RUN pnpm -C apps/api build

# ------ Runtime (produção) ------
FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate

# Metadados e pacotes para resolver o workspace da API
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/api/package.json ./apps/api/package.json

# Instala SOMENTE deps de produção da API
RUN pnpm install --filter ./apps/api... --prod

# Copia artefatos buildados
COPY --from=build /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api
EXPOSE 4000
CMD ["pnpm","start:prod"]
