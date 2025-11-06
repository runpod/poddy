# Poddy

Welcome to the repository for Poddy, a Discord bot created to help the Runpod community server function.

## Self Hosting

### Prerequisites

- Node.js `v20` or higher
- PNPM package manager

### Quick Start

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment files:
   - Duplicate `.env.example` to `.env.dev`
   - Modify all values accordingly

3. Generate Prisma clients:
   ```bash
   pnpx prisma generate                                   # Generate main database client
   pnpx prisma generate --schema=prisma/qa-schema.prisma  # Generate QA database client
   ```
   Note: Run these commands whenever you modify the Prisma schemas

4. Start local database and create tables (requires Docker):
   ```bash
   pnpm db:start
   pnpm db:migrate
   ```

5. Run the bot:
   ```bash
   pnpm build
   ```

### Running the Bot

Use `pnpm build` to run the development version of the bot.

The only difference between the production and development version is that the development has debug logs to assist with development, and uses guild commands in the development server instead of global commands.

### Database Management

Useful database commands:

- **Start database**: `pnpm db:start` - Starts PostgreSQL in Docker
- **Stop database**: `pnpm db:stop` - Stops PostgreSQL container
- **Reset database**: `pnpm db:reset` - Deletes all data and restarts fresh
- **Run migrations**: `pnpm db:migrate` - Apply schema changes
- **Database UI (Main DB)**: `pnpm db:studio` - Opens Prisma Studio for main database
- **Database UI (QA DB)**: `pnpm db:studio:qa` - Opens Prisma Studio for QA threads database (requires `.env` with `QA_DATABASE_URL`)

### Troubleshooting

**Error: `Type 'K' cannot be used to index type 'LanguageValues'` (TypeScript errors in Language files)**
- Run `pnpm translate` to regenerate language type definitions
- This command updates `typings/language.d.ts` from your language files

For support, please open an issue.
