FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
    else echo "Lockfile not found." && exit 1; \
    fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Copy build-time env file
COPY .env.build .env

# Set Docker build environment variable
ENV DOCKER_BUILD=true

# Generate Prisma Client
RUN npx prisma generate

# Build the project
RUN yarn build

# Production image - NOT using standalone
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV TZ America/Sao_Paulo

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN apk add --no-cache libc6-compat

# Copy all necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/yarn.lock* ./yarn.lock*
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy Prisma files
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts

# Copy entrypoint script
COPY --from=builder --chown=nextjs:nodejs /app/scripts/start.sh ./scripts/start.sh
RUN chmod +x ./scripts/start.sh

USER nextjs

EXPOSE 3115

ENV PORT=3115
ENV INTERNAL_PORT=3115
ENV HOSTNAME "0.0.0.0"

CMD ["./scripts/start.sh"]
