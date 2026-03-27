FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

FROM base AS build

ENV HUSKY=0
ENV NEXT_TELEMETRY_DISABLED=1

# Copy manifest files only — pnpm install layer is cached until lock file changes
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json turbo.json ./
COPY apps/portfolio/package.json ./apps/portfolio/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY apps/worker/package.json ./apps/worker/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/ui/avatar/package.json ./packages/ui/avatar/package.json
COPY packages/ui/dialog/package.json ./packages/ui/dialog/package.json
COPY packages/ui/file-upload/package.json ./packages/ui/file-upload/package.json
COPY packages/ui/form/package.json ./packages/ui/form/package.json
COPY packages/ui/theme/package.json ./packages/ui/theme/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/tsconfig/package.json ./packages/tsconfig/package.json

RUN pnpm install --frozen-lockfile

# Copy source after install so the install layer stays cached on code changes
COPY apps/portfolio ./apps/portfolio
COPY packages ./packages

RUN pnpm exec turbo run build --filter=@supportops/portfolio

FROM node:20-alpine AS runtime

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3001

WORKDIR /app

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=build /app/apps/portfolio/public ./apps/portfolio/public
COPY --from=build /app/apps/portfolio/.next/standalone ./
COPY --from=build /app/apps/portfolio/.next/static ./apps/portfolio/.next/static

USER nextjs

EXPOSE 3001

CMD ["node", "apps/portfolio/server.js"]
