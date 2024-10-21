import { ConvexError } from "convex/values"
import { expect, test } from "vitest"
import { api } from "./_generated/api"
import {
	createConvexTest,
	createConvexTestWithIdentity,
} from "./testing/helpers"

test("create and get scene", async () => {
	const convex = await createConvexTestWithIdentity()

	const roomId = await convex.mutation(api.rooms.create, {
		name: "Test Room",
		slug: "test-room",
	})

	const sceneId = await convex.mutation(api.scenes.create, {
		name: "Test Scene",
		roomId,
		mode: "battlemap",
	})

	const scene = await convex.query(api.scenes.get, { sceneId })

	expect(scene).toMatchObject({
		name: "Test Scene",
		roomId,
		mode: "battlemap",
	})
})

test("list scenes", async () => {
	const convex = await createConvexTestWithIdentity()

	const roomId = await convex.mutation(api.rooms.create, {
		name: "Test Room",
		slug: "test-room",
	})

	await convex.mutation(api.scenes.create, {
		name: "Scene 1",
		roomId,
		mode: "scenery",
	})

	await convex.mutation(api.scenes.create, {
		name: "Scene 2",
		roomId,
		mode: "battlemap",
	})

	const scenes = await convex.query(api.scenes.list, { roomId })

	expect(scenes).toHaveLength(2)
	expect(scenes[0]?.name).toBe("Scene 1")
	expect(scenes[1]?.name).toBe("Scene 2")
})

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

	await convex.mutation(api.scenes.create, {
		roomId: firstRoom,
		name: "First Room Scene 1",
	})

	await convex.mutation(api.scenes.create, {
		roomId: firstRoom,
		name: "First Room Scene 2",
	})

	await convex.mutation(api.scenes.create, {
		roomId: secondRoom,
		name: "Second Room Scene",
	})

	expect(
		await convex.query(api.scenes.list, { roomId: firstRoom }),
	).toHaveLength(2)
	expect(
		await convex.query(api.scenes.list, { roomId: secondRoom }),
	).toHaveLength(1)
})

test("update scene", async () => {
	const convex = await createConvexTestWithIdentity()

	const roomId = await convex.mutation(api.rooms.create, {
		name: "Test Room",
		slug: "test-room",
	})

	const sceneId = await convex.mutation(api.scenes.create, {
		name: "Original Name",
		roomId,
		mode: "scenery",
	})

	await convex.mutation(api.scenes.update, {
		sceneId,
		name: "Updated Name",
		mode: "battlemap",
	})

	const updatedScene = await convex.query(api.scenes.get, { sceneId })

	expect(updatedScene).toMatchObject({
		name: "Updated Name",
		mode: "battlemap",
	})
})

test("delete scene", async () => {
	const convex = await createConvexTestWithIdentity()

	const roomId = await convex.mutation(api.rooms.create, {
		name: "Test Room",
		slug: "test-room",
	})

	const sceneId = await convex.mutation(api.scenes.create, {
		name: "To Be Deleted",
		roomId,
		mode: "scenery",
	})

	await convex.mutation(api.scenes.remove, { sceneIds: [sceneId] })

	const deletedScene = await convex.query(api.scenes.get, { sceneId })

	expect(deletedScene).toBeNull()
})

test("non-owner cannot create scene", async () => {
	const convex = createConvexTest()
	const ownerConvex = await createConvexTestWithIdentity(convex)
	const nonOwnerConvex = await createConvexTestWithIdentity(convex)

	const roomId = await ownerConvex.mutation(api.rooms.create, {
		name: "Test Room",
		slug: "test-room",
	})

	await expect(
		nonOwnerConvex.mutation(api.scenes.create, {
			name: "Unauthorized Scene",
			roomId,
			mode: "scenery",
		}),
	).rejects.toThrow(ConvexError)
})

test("non-owner cannot update scene", async () => {
	const convex = createConvexTest()
	const ownerConvex = await createConvexTestWithIdentity(convex)
	const nonOwnerConvex = await createConvexTestWithIdentity(convex)

	const roomId = await ownerConvex.mutation(api.rooms.create, {
		name: "Test Room",
		slug: "test-room",
	})

	const sceneId = await ownerConvex.mutation(api.scenes.create, {
		name: "Protected Scene",
		roomId,
		mode: "scenery",
	})

	await expect(
		nonOwnerConvex.mutation(api.scenes.update, {
			sceneId,
			name: "Hacked Scene",
		}),
	).rejects.toThrow(ConvexError)
})

test("non-owner cannot delete scene", async () => {
	const convex = createConvexTest()
	const ownerConvex = await createConvexTestWithIdentity(convex)
	const nonOwnerConvex = await createConvexTestWithIdentity(convex)

	const roomId = await ownerConvex.mutation(api.rooms.create, {
		name: "Test Room",
		slug: "test-room",
	})

	const sceneId = await ownerConvex.mutation(api.scenes.create, {
		name: "Protected Scene",
		roomId,
		mode: "scenery",
	})

	await expect(
		nonOwnerConvex.mutation(api.scenes.remove, { sceneIds: [sceneId] }),
	).rejects.toThrow(ConvexError)
})

test("search scenes", async () => {
	const convex = await createConvexTestWithIdentity()

	const roomId = await convex.mutation(api.rooms.create, {
		name: "Test Room",
		slug: "test-room",
	})

	await convex.mutation(api.scenes.create, {
		name: "Alpha Scene",
		roomId,
		mode: "scenery",
	})

	await convex.mutation(api.scenes.create, {
		name: "Beta Scene",
		roomId,
		mode: "battlemap",
	})

	await convex.mutation(api.scenes.create, {
		name: "Gamma Scene",
		roomId,
		mode: "scenery",
	})

	const searchResults = await convex.query(api.scenes.list, {
		roomId,
		search: "Beta",
	})

	expect(searchResults).toHaveLength(1)
	expect(searchResults[0]?.name).toBe("Beta Scene")
})

test("create scene with background", async () => {
	const convex = await createConvexTestWithIdentity()

	const roomId = await convex.mutation(api.rooms.create, {
		name: "Test Room",
		slug: "test-room",
	})

	const sceneId = await convex.mutation(api.scenes.create, {
		name: "Scene with Background",
		roomId,
		mode: "scenery",
		sceneryBackgroundId: "test_background_id" as any,
	})

	const scene = await convex.query(api.scenes.get, { sceneId })

	expect(scene).toMatchObject({
		name: "Scene with Background",
		sceneryBackgroundId: "test_background_id",
	})
})
