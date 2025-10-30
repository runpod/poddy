ARG NODE_VERSION
ARG CI

FROM node:${NODE_VERSION:-22} AS base

ENV PNPM_HOME="/app/.pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR "/app"
COPY . .

RUN --mount=type=cache,id=pnpm,target=/app/.pnpm/store \
    CI={CI} pnpm install --frozen-lockfile && \
    pnpm run translate && \
    pnpm prisma generate && \
    pnpm prisma generate --schema=prisma/qa-schema.prisma && \
    pnpm prisma migrate deploy && \
    pnpm tsc

CMD [ "pnpm", "start" ]
