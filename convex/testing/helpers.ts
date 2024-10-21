import { convexTest, TestConvexForDataModel } from "convex-test"
import { DataModel, Id } from "../_generated/dataModel"
import schema from "../schema"

export function createConvexTest() {
	return convexTest(schema, import.meta.glob("../**/*.ts"))
}

let nextId = 0
export async function createConvexTestWithIdentity(
	convex = createConvexTest(),
	{ name = `maple_${nextId++}` } = {},
): Promise<TestConvexForDataModel<DataModel>> {
	const userId = await convex.run(async (ctx) => {
		return await ctx.db.insert("users", {})
	})

	return convex.withIdentity({
		name,
		subject: userId as Id<"users">,
	})
}
