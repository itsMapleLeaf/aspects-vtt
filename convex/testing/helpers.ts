import { convexTest, TestConvexForDataModel } from "convex-test"
import { DataModel, Id } from "../_generated/dataModel"
import schema from "../schema"

export function createConvexTest() {
	return convexTest(schema, import.meta.glob("../**/*.ts"))
}

export async function createConvexTestWithIdentity(
	convex = createConvexTest(),
): Promise<TestConvexForDataModel<DataModel>> {
	const userId = await convex.run(async (ctx) => {
		return await ctx.db.insert("users", {})
	})

	return convex.withIdentity({
		name: "testUser",
		subject: userId as Id<"users">,
	})
}
