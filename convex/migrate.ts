// @ts-nocheck
import { makeMigration, startMigrationsSerially } from "convex-helpers/server/migrations"
import { internalMutation } from "./_generated/server.js"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const migration = makeMigration(internalMutation, {
	migrationTable: "migrations",
})

export default internalMutation(async (ctx) => {
	await startMigrationsSerially(ctx, [])
})
