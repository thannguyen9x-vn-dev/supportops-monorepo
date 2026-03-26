FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

FROM base AS build

ENV HUSKY=0

# Copy manifest files only — pnpm install layer is cached until lock file changes
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json tsconfig.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/api/package.json ./apps/api/package.json
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
COPY apps ./apps
COPY packages ./packages

RUN pnpm --filter @supportops/api prisma:generate
# turbo resolves dependency order automatically
RUN pnpm exec turbo run build --filter=@supportops/api

FROM node:20-alpine AS runtime

ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

RUN corepack enable \
  && addgroup -S nodejs \
  && adduser -S nestjs -G nodejs

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
# Copy only api app, not web or worker
COPY --from=build /app/apps/api ./apps/api
COPY --from=build /app/packages ./packages

USER nestjs

EXPOSE 8081

CMD ["node", "apps/api/dist/main.js"]
