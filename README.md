# aspects-vtt

A simple virtual tabletop for the [Aspects of Nature](https://itsmapleleaf.notion.site/Aspects-of-Nature-5b4407e7a0b34a64ae6d32ca7663e7f2?pvs=4) tabletop RPG.

## Development

Requirements:

- [Bun](https://bun.sh/)
- [Nushell](https://nushell.sh/)

### Bun

This project uses [Bun](https://bun.sh/) instead of Node.js for development and managing dependencies.

```sh
# install dependencies
bun install

# run the development server
bun dev

# list all other available scripts
bun run
```

### Clerk

This project uses [Clerk](https://clerk.com) for authentication. If you haven't already, [create an app on the Clerk dashboard](https://dashboard.clerk.com/). Generate a set of API keys and add them to your `.env.local` file:

```env
# .env.local
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Convex

This project uses [Convex](https://convex.dev) for realtime data storage. If you haven't already, [create a Convex project on the dashboard](https://dashboard.convex.dev/).

After that, link the repo with your Convex project:

```sh
bunx convex dev --once
```

Then, copy `.env.convex.example` to `.env.convex.local` and fill in the environment variables. Then you can run `nu scripts/update-convex-env.nu` to update the environment variables in Convex.

```sh
cp .env.convex.example .env.convex.local
nu scripts/update-convex-env.nu
```

### Running the app - VSCode

Press F5 to start the development server with debugging.

### Running the app - Command Line

Run `bun dev` to start the development server.
