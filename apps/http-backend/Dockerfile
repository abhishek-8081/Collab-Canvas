FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build --filter=http-backend

FROM node:20-slim
WORKDIR /app
COPY --from=build /app /app

EXPOSE 3001
CMD [ "pnpm", "start", "--filter", "http-backend" ]
