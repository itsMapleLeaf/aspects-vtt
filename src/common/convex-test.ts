import { convexTest, type TestConvexForDataModel } from "convex-test"
import type { DataModel, Id } from "../../convex/_generated/dataModel"
import schema from "../../convex/schema.ts"

export function createConvexTest() {
	return convexTest(schema, import.meta.glob("../**/*.ts"))
}

export async function createConvexTestWithIdentity(
	convex = createConvexTest(),
	{ name = `maple_${crypto.randomUUID()}` } = {},
): Promise<TestConvexForDataModel<DataModel>> {
	const userId = await convex.run(async (ctx) => {
		return await ctx.db.insert("users", {})
	})

	return convex.withIdentity({
		name,
		subject: userId as Id<"users">,
	})
}
