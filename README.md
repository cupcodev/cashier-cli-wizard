# Cupcode Cha$hier — Monorepo (bootstrap)
Para rodar local:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
docker compose -f infra/docker/docker-compose.yml up -d --build
