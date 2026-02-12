# Contributing

## Prerequisites

- Node.js v24 (see `.node-version`)
- pnpm (managed by corepack, v10)
- Docker (for local PostgreSQL)

## Setup

```bash
pnpm install
cp .env.example .env.dev    # fill in your values
pnpm db:start               # start PostgreSQL
pnpm db:migrate             # apply schema
```

The Prisma client is generated automatically during `pnpm install`. If you modify the Prisma schema, regenerate with `pnpx prisma generate`.

## Running

`pnpm build` compiles TypeScript **and** runs the bot in development mode. It is not a build-only step.

- Dev (`pnpm build`): guild commands, debug logging, `.env.dev`, `api.runpod.dev`
- Prod (`pnpm start`): global commands, `.env.prod`, `api.runpod.io`

## Common Commands

| Command | Purpose |
|---------|---------|
| `pnpm build` | Compile and run in development mode |
| `pnpm start` | Run the compiled bot in production mode |
| `pnpm translate` | Regenerate `typings/language.d.ts` from language files |
| `pnpm db:start` | Start PostgreSQL via Docker |
| `pnpm db:stop` | Stop PostgreSQL |
| `pnpm db:reset` | Reset database (destroy and recreate) |
| `pnpm db:migrate` | Apply Prisma schema changes |
| `pnpm db:studio` | Open Prisma Studio |

## Language Strings

Language strings live in `languages/en-US.ts`. The file `typings/language.d.ts` is auto-generated from it -- never edit it manually.

After adding or changing language keys:

```bash
pnpm translate
```

This scans `en-US.ts` for `{{variable}}` patterns and regenerates the typed interface so `language.get("KEY", { variable })` is type-safe. The lint-staged config runs this automatically on commit if language files changed, but during development you need to run it yourself.

## Code Style & Tooling

- **Biome** handles formatting and linting (tabs, 120-char line width). Not ESLint or Prettier.
- Do **not** manually organize or sort imports -- Biome handles this automatically.
- **Husky + lint-staged** runs Biome and Prisma format on commit.
- `typings/language.d.ts` is excluded from Biome since it's generated.
- Array types use shorthand syntax (`string[]` not `Array<string>`).

## Troubleshooting

**`Type 'K' cannot be used to index type 'LanguageValues'`** -- Run `pnpm translate` to regenerate language type definitions.
