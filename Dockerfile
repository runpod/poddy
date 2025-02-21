ARG NODE_VERSION

FROM node:${NODE_VERSION:-20} AS base

WORKDIR "/app"
COPY . .
VOLUME ["/app"]

FROM base AS prod-deps
RUN npm install --omit=dev
RUN npx prisma generate
RUN npx prisma migrate deploy

FROM base AS build
RUN npm install
RUN npm run translate
RUN npx prisma generate
RUN npx prisma migrate deploy
RUN npx tsc

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
CMD [ "npm", "start" ]
