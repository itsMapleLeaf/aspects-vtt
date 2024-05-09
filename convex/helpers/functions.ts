import { entsTableFactory } from "convex-ents"
import { customCtx, customMutation, customQuery } from "convex-helpers/server/customFunctions"
import * as server from "../_generated/server"
import { entDefinitions } from "../schema"

export const query = customQuery(
	server.query,
	customCtx(async (ctx) => {
		return {
			table: entsTableFactory(ctx, entDefinitions),
			db: ctx.db as server.DatabaseReader,
		}
	}),
)

export const internalQuery = customQuery(
	server.internalQuery,
	customCtx(async (ctx) => {
		return {
			table: entsTableFactory(ctx, entDefinitions),
			db: ctx.db as server.DatabaseReader,
		}
	}),
)

export const mutation = customMutation(
	server.mutation,
	customCtx(async (ctx) => {
		return {
			table: entsTableFactory(ctx, entDefinitions),
			db: ctx.db as server.DatabaseWriter,
		}
	}),
)

export const internalMutation = customMutation(
	server.internalMutation,
	customCtx(async (ctx) => {
		return {
			table: entsTableFactory(ctx, entDefinitions),
			db: ctx.db as server.DatabaseWriter,
		}
	}),
)
