FROM oven/bun:1 AS dependencies
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

FROM oven/bun:1 AS builder
WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
RUN bun run build

FROM oven/bun:1-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lock* ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next/

CMD ["bun", "run", "start", "-p", "8001"]
