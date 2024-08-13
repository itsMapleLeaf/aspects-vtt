# aspects-vtt

A simple virtual tabletop for the [Aspects of Nature](https://itsmapleleaf.notion.site/Aspects-of-Nature-5b4407e7a0b34a64ae6d32ca7663e7f2?pvs=4) tabletop RPG.

## Development

Requirements:

- [pnpm](https://pnpm.io/)
- [Bun](https://bun.sh/)
- [Nushell](https://nushell.sh/)

```sh
# install dependencies
pnpm install

# run the development server
pnpm dev

# list all other available scripts
pnpm run
```

### Convex

This project uses [Convex](https://convex.dev) for realtime data storage. If you haven't already, [create a Convex project on the dashboard](https://dashboard.convex.dev/).

After that, link the repo with your Convex project:

```sh
pnpm convex dev --once
```

Then add the appropriate environment variables in Convex, as required in `convex/env.ts`

### Running the app - VSCode

Press F5 to start the development server with debugging.

### Running the app - Command Line

Run `pnpm dev` to start the development server.
