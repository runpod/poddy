# Poddy

The Discord bot for the Runpod community Discord. Handles support workflows, community features, incident reporting, and AI-assisted Q&A.

## Quick Start

```bash
pnpm install
cp .env.example .env.dev    # fill in your values
pnpm db:start               # start PostgreSQL via Docker
pnpm db:migrate             # apply schema
pnpm build                  # compile and run in development mode
```

The Prisma client is generated automatically during `pnpm install`. If you modify the Prisma schema, regenerate with `pnpx prisma generate`.

## Running the Bot

Use `pnpm build` to compile and run in development mode. This is not a build-only step.

- **Dev** (`pnpm build`): guild commands, debug logging, `.env.dev`, `api.runpod.dev`
- **Prod** (`pnpm start`): global commands, `.env.prod`, `api.runpod.io`

## Database Management

| Command | Purpose |
|---------|---------|
| `pnpm db:start` | Start PostgreSQL in Docker |
| `pnpm db:stop` | Stop PostgreSQL container |
| `pnpm db:reset` | Delete all data and restart fresh |
| `pnpm db:migrate` | Apply schema changes |
| `pnpm db:studio` | Open Prisma Studio |

## Troubleshooting

**`Type 'K' cannot be used to index type 'LanguageValues'`** -- Run `pnpm translate` to regenerate language type definitions from `languages/en-US.ts`.

For support, please open an issue.
