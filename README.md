# Poddy

Welcome to the repository for Poddy, a Discord bot created to help the Runpod community server function.

## Self Hosting

To run this bot you need to be on at least node.js `v20`, from there make sure you have
PNPM installed and run `pnpm install` to install all of our dependencies.

Once all of our dependencies are installed please duplicate `.env.example` to `.env.prod`
and `.env.dev`, then modify all the values accordingly, and the same for `./prisma/.env`.

To run the production version of this bot please run `pnpm start`, for support - please open an issue.

If you want to run the development version run `pnpm build`.

The only difference between the production and development version is that the development
has debug logs to assist with development, and uses guild commands in the development server
instead of global commands.
