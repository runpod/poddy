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
   - Duplicate `.env.example` to `.env.dev` (and `.env.prod` for production)
   - Modify all values accordingly

3. Start local database and create tables (requires Docker):
   ```bash
   pnpm db:start
   pnpm db:migrate
   ```

4. Run the bot:
   ```bash
   pnpm build
   ```

### Running the Bot

#### Development Mode
```bash
pnpm build
```
- Uses `.env.dev` environment file
- Enables debug logs
- Uses guild commands in development server instead of global commands
- Compiles TypeScript and runs with `NODE_ENV=development`

#### Production Mode
```bash
pnpm start
```
- Uses `.env.prod` environment file (must exist)
- Runs with `NODE_ENV=production`
- Uses global Discord commands

### Database Management

Useful database commands:

- **Start database**: `pnpm db:start` - Starts PostgreSQL in Docker
- **Stop database**: `pnpm db:stop` - Stops PostgreSQL container
- **Reset database**: `pnpm db:reset` - Deletes all data and restarts fresh
- **Run migrations**: `pnpm db:migrate` - Apply schema changes
- **Database UI**: `pnpm db:studio` - Opens Prisma Studio (web interface)

### Troubleshooting

**Error: `options.port should be >= 0 and < 65536. Received type number (NaN)`**
- Ensure your `.env.prod` or `.env.dev` file has `API_PORT` configured (e.g., `API_PORT=3000`)

**Error: `Property 'qAThread' does not exist on type 'PrismaClient'`**
- Run `npx prisma generate` to regenerate the Prisma client after schema changes

**Error: `Can't reach database server at mydb.orb.local:5432`**
- Start the local PostgreSQL database with `pnpm db:start`
- Ensure `./prisma/.env` has the correct `DATABASE_URL`
- For local development, use: `postgresql://poddy:poddy_dev_password@localhost:5432/poddy_dev`

**Error: `Type 'K' cannot be used to index type 'LanguageValues'` (TypeScript errors in Language files)**
- Run `pnpm translate` to regenerate language type definitions
- This command updates `typings/language.d.ts` from your language files

For support, please open an issue.
