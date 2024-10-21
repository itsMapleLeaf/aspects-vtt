import { expect, test } from "vitest"
import { api } from "./_generated/api.js"
import { createConvexTest } from "./testing/helpers.ts"

test("me returns the authenticated user", async () => {
	const convex = createConvexTest()

	const id = await convex.run(async (ctx) => {
		return await ctx.db.insert("users", { name: "maple" })
	})

	const authorized = convex.withIdentity({ subject: id })

	const user = await authorized.query(api.users.me)
	expect(user).toMatchObject({ name: "maple" })
})

test("me returns null when signed out", async () => {
	const convex = createConvexTest()
	const user = await convex.query(api.users.me)
	expect(user).toBeNull()
})
