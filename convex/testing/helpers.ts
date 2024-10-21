import { convexTest, TestConvexForDataModel } from "convex-test"
import { DataModel, Id } from "../_generated/dataModel"
import schema from "../schema"

export async function createConvexTestWithIdentity(): Promise<
	TestConvexForDataModel<DataModel>
> {
	const convex = convexTest(schema, import.meta.glob("../**/*.ts"))

	const userId = await convex.run(async (ctx) => {
		return await ctx.db.insert("users", {})
	})

	return convex.withIdentity({
		name: "testUser",
		subject: userId as Id<"users">,
	})
}
