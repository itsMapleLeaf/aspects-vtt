import { expect, test } from "vitest"
import { api } from "./_generated/api"
import { createConvexTestWithIdentity } from "./testing/helpers"

test("list returns scenes only for the given room", async () => {
	const convex = await createConvexTestWithIdentity()

	const firstRoom = await convex.mutation(api.rooms.create, {
		name: "first",
		slug: "first",
	})

	const secondRoom = await convex.mutation(api.rooms.create, {
		name: "second",
		slug: "second",
	})

	const firstScene = await convex.mutation(api.scenes.create, {
		roomId: firstRoom,
	})

	const secondScene = await convex.mutation(api.scenes.create, {
		roomId: firstRoom,
	})

	const thirdScene = await convex.mutation(api.scenes.create, {
		roomId: secondRoom,
	})

	expect(
		await convex.query(api.scenes.list, { roomId: firstRoom }),
	).toHaveLength(2)
	expect(
		await convex.query(api.scenes.list, { roomId: secondRoom }),
	).toHaveLength(1)
})
