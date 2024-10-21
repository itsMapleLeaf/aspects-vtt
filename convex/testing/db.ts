import { ArgsArrayForOptionalValidator } from "convex/server"
import { PropertyValidators, v } from "convex/values"
import { Id } from "../_generated/dataModel"
import { EntMutationCtx, EntTableNames, mutation } from "../lib/ents.ts"
import { entDefinitions } from "../schema.ts"

export const insert = testMutation({
	args: {
		table: v.string(),
		doc: v.record(v.string(), v.any()),
	},
	async handler(ctx, args) {
		return await ctx.table(args.table as EntTableNames).insert(args.doc)
	},
})

export const update = testMutation({
	args: {
		table: v.string(),
		id: v.string(),
		patch: v.record(v.string(), v.any()),
	},
	async handler(ctx, args) {
		return await ctx
			.table(args.table as EntTableNames)
			.getX(args.id as Id<EntTableNames>)
			.patch(args.patch)
	},
})

export const remove = testMutation({
	args: {
		table: v.string(),
		id: v.string(),
	},
	async handler(ctx, args) {
		await ctx
			.table(args.table as EntTableNames)
			.getX(args.id as Id<EntTableNames>)
			.delete()
	},
})

export { clearTableMutation as clear }
const clearTableMutation = testMutation({
	args: {
		table: v.string(),
	},
	async handler(ctx, args) {
		await clearTable(ctx, args)
	},
})

export const reset = testMutation({
	args: {},
	async handler(ctx) {
		const tables = Object.keys(entDefinitions)
		await Promise.all(tables.map((table) => clearTable(ctx, { table })))
	},
})

async function clearTable(ctx: EntMutationCtx, args: { table: string }) {
	const tableName = args.table as EntTableNames
	const allDocs = await ctx.table(tableName)
	await Promise.all(
		allDocs.map((doc) => ctx.table(tableName).getX(doc._id).delete()),
	)
}

function testMutation<
	Args extends PropertyValidators | void,
	ArgsArray extends ArgsArrayForOptionalValidator<Args>,
	Return,
>(config: {
	args: Args
	handler: (ctx: EntMutationCtx, ...args: ArgsArray) => Promise<Return>
}) {
	return mutation({
		args: config.args,
		async handler(ctx, ...args: ArgsArray) {
			if (process.env.TEST !== "true") {
				throw new Error("Not in test environment")
			}
			return await config.handler(ctx, ...args)
		},
	})
}
