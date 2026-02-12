# AGENTS.md

This file provides guidance to AI agents and coding assistants working with this repository.

## What is This?

Poddy is the **Discord bot for the Runpod community server**. It handles support workflows (Zendesk escalation, auto-threads), community features (tags, events, invites), Runpod account linking, incident status reporting (BetterStack), and AI-assisted Q&A (Mastra).

It's built directly on the Discord API via `@discordjs/core`, `@discordjs/rest`, and `@discordjs/ws` -- not a high-level framework like discord.js (although discord.js is available for ease of development, please prefer the @discordjs/* suite of libraries).

## Tooling

- **Package manager:** pnpm (v10, defined in `packageManager` field)
- **Node version:** 24 (see `.node-version`)
- **Formatter/linter:** Biome (tabs, 120-char line width) -- **not** ESLint or Prettier. Do **not** manually organize imports; Biome handles this automatically.
- **Pre-commit hooks:** Husky + lint-staged runs Biome and Prisma format on staged files.
- **Database:** PostgreSQL via Prisma ORM, local dev via Docker Compose.

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm build` | Compile TypeScript **and** run the bot in development mode (not build-only) |
| `pnpm start` | Run the compiled bot in production mode |
| `pnpm translate` | Regenerate `typings/language.d.ts` from language files |
| `pnpm db:start` | Start PostgreSQL via Docker |
| `pnpm db:stop` | Stop PostgreSQL |
| `pnpm db:reset` | Reset database (destroy and recreate) |
| `pnpm db:migrate` | Apply Prisma schema changes |
| `pnpm db:studio` | Open Prisma Studio |

## Environment

Two environment files control dev vs prod behavior:

- `.env.dev` -- guild commands, debug logging, `api.runpod.dev`
- `.env.prod` -- global commands, `api.runpod.io`

Loaded based on `NODE_ENV`. See `.env.example` for required variables.

## Architecture

```
config/             Bot config (intents, presence, colors, prefixes)
languages/          i18n strings (en-US.ts) and the typings generator
  utils/interface.ts   Generates typings/language.d.ts -- do NOT edit that file manually
lib/                Shared framework layer (base classes, handlers, client)
  classes/          Base classes: ApplicationCommand, Button, Modal, SelectMenu, EventHandler, etc.
  extensions/       ExtendedClient -- the core client everything builds on
  utilities/        Base Functions class, permissions, sentry
prisma/             Schema, migrations, generated client
  __generated__/    Prisma-generated client (import as @db/*)
src/                Bot-specific logic
  bot/
    applicationCommands/{category}/{command}.ts   Slash commands and context menus
    autoCompletes/{category}/{autocomplete}.ts    Command option autocomplete handlers
    buttons/{category}/{button}.ts                Button interaction handlers
    modals/{category}/{modal}.ts                  Modal submit handlers
    selectMenus/{category}/{menu}.ts              Select menu handlers
    textCommands/{category}/{command}.ts           Prefix-based text commands
    events/{eventName}.ts                         Gateway event handlers
  utilities/        PoddyFunctions (Zendesk, BetterStack), GraphQL, Mastra
  client.ts         PoddyClient extends ExtendedClient
  index.ts          Entry point
typings/
  env.d.ts          Environment variable types
  language.d.ts     AUTO-GENERATED -- run `pnpm translate` after changing language strings
```

### Path Aliases

- `@lib/*` -> `./lib/*`
- `@src/*` -> `./src/*`
- `@db/*` -> `./prisma/__generated__/*`
- `@lib/typings/language.js` -> `./typings/language.d.ts`

### Class Hierarchy

```
ExtendedClient (lib/extensions/ExtendedClient.ts)
  └── PoddyClient (src/client.ts)
        - overrides `get functions()` to return PoddyFunctions

Functions (lib/utilities/functions.ts)
  └── PoddyFunctions (src/utilities/functions.ts)
```

Base classes like `Button`, `Modal`, and `SelectMenu` support a generic for the client type: `Button<PoddyClient>`. Use this when you need access to `PoddyFunctions` methods via `this.client.functions`.

### Interaction Routing

Buttons, modals, and select menus are matched by `custom_id.startsWith(handler.name)`. The remaining segments of the custom_id are dot-separated metadata parsed in the handler.

Application commands are matched by `${name}-${type}`.

### HTTP Server

A Hono-based HTTP server (`lib/classes/Server.ts`) starts alongside the bot, listening on `API_PORT`.

## Language System

Strings live in `languages/en-US.ts`. Interpolation uses `{{variableName}}` syntax. `typings/language.d.ts` is auto-generated -- never edit it manually, run `pnpm translate` after changing language strings.

## Key Integrations

- **Zendesk** -- Ticket creation from Discord messages/threads (`src/utilities/functions.ts`, `src/bot/*/zendesk/*`)
- **BetterStack** -- Incident status reports from uptime.runpod.io (`src/bot/events/ready.ts`)
- **Mastra** -- AI Q&A when the bot is mentioned in allowed channels (`src/utilities/mastra.ts`)

## Development

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for code-specific rules and workflow instructions.
