import { ConvexError } from "convex/values"
import { expect, test } from "vitest"
import { api } from "./_generated/api"
import {
	createConvexTest,
	createConvexTestWithIdentity,
} from "./testing/helpers"

test("create and get token", async () => {
	const convex = createConvexTest()
	const ownerConvex = await createConvexTestWithIdentity(convex)

	const roomId = await ownerConvex.mutation(api.rooms.create, {
		name: "Test Room",
		slug: "test-room",
	})

	const sceneId = await ownerConvex.mutation(api.scenes.create, {
		name: "Test Scene",
		roomId,
		mode: "battlemap",
	})

	const characterId = await ownerConvex.mutation(api.characters.create, {
		name: "Test Character",
		roomId,
		attributes: { strength: 3, sense: 2, mobility: 4, intellect: 3, wit: 2 },
	})

	await ownerConvex.mutation(api.tokens.create, {
		inputs: [
			{
				sceneId,
				characterId,
				position: { x: 100, y: 200 },
				visible: true,
			},
		],
	})

	const token = await ownerConvex.query(api.tokens.get, {
		characterId,
		sceneId,
	})

	expect(token).toMatchObject({
		sceneId,
		characterId,
		position: { x: 100, y: 200 },
		visible: true,
	})
})

test("list tokens", async () => {
	const convex = createConvexTest()
	const ownerConvex = await createConvexTestWithIdentity(convex)

	const roomId = await ownerConvex.mutation(api.rooms.create, {
		name: "Test Room",
		slug: "test-room",
	})

	const sceneId = await ownerConvex.mutation(api.scenes.create, {
		name: "Test Scene",
		roomId,
		mode: "battlemap",
	})

	const characterId = await ownerConvex.mutation(api.characters.create, {
		name: "Test Character",
		roomId,
		attributes: { strength: 3, sense: 2, mobility: 4, intellect: 3, wit: 2 },
	})

	await ownerConvex.mutation(api.tokens.create, {
		inputs: [
			{
				sceneId,
				characterId,
				position: { x: 100, y: 200 },
				visible: true,
			},
		],
	})

	const tokens = await ownerConvex.query(api.tokens.list, { sceneId })

	expect(tokens).toHaveLength(1)
	expect(tokens[0]).toMatchObject({
		position: { x: 100, y: 200 },
		visible: true,
		character: expect.objectContaining({
			_id: characterId,
		}),
	})
})

test("update token", async () => {
	const convex = createConvexTest()
	const ownerConvex = await createConvexTestWithIdentity(convex)

	const roomId = await ownerConvex.mutation(api.rooms.create, {
		name: "Test Room",
		slug: "test-room",
	})

	const sceneId = await ownerConvex.mutation(api.scenes.create, {
		name: "Test Scene",
		roomId,
		mode: "battlemap",
	})

	const characterId = await ownerConvex.mutation(api.characters.create, {
		name: "Test Character",
		roomId,
		attributes: { strength: 3, sense: 2, mobility: 4, intellect: 3, wit: 2 },
	})

	await ownerConvex.mutation(api.tokens.create, {
		inputs: [
			{
				sceneId,
				characterId,
				position: { x: 100, y: 200 },
				visible: true,
			},
		],
	})

	const token = await ownerConvex.query(api.tokens.get, {
		characterId,
		sceneId,
	})

	await ownerConvex.mutation(api.tokens.update, {
		updates: [
			{
				tokenId: token!._id,
				position: { x: 300, y: 400 },
				visible: false,
			},
		],
	})

	const updatedToken = await ownerConvex.query(api.tokens.get, {
		characterId,
		sceneId,
	})

	expect(updatedToken).toMatchObject({
		position: { x: 300, y: 400 },
		visible: false,
	})
})

test("remove token", async () => {
	const convex = createConvexTest()
	const ownerConvex = await createConvexTestWithIdentity(convex)

	const roomId = await ownerConvex.mutation(api.rooms.create, {
		name: "Test Room",
		slug: "test-room",
	})

	const sceneId = await ownerConvex.mutation(api.scenes.create, {
		name: "Test Scene",
		roomId,
		mode: "battlemap",
	})

	const characterId = await ownerConvex.mutation(api.characters.create, {
		name: "Test Character",
		roomId,
		attributes: { strength: 3, sense: 2, mobility: 4, intellect: 3, wit: 2 },
	})

	await ownerConvex.mutation(api.tokens.create, {
		inputs: [
			{
				sceneId,
				characterId,
				position: { x: 100, y: 200 },
				visible: true,
			},
		],
	})

	const token = await ownerConvex.query(api.tokens.get, {
		characterId,
		sceneId,
	})

	await ownerConvex.mutation(api.tokens.remove, {
		tokenIds: [token!._id],
	})

	const removedToken = await ownerConvex.query(api.tokens.get, {
		characterId,
		sceneId,
	})

	expect(removedToken).toBeNull()
})

test("non-owner cannot create token", async () => {
	const convex = createConvexTest()
	const ownerConvex = await createConvexTestWithIdentity(convex)
	const nonOwnerConvex = await createConvexTestWithIdentity(convex)

	const roomId = await ownerConvex.mutation(api.rooms.create, {
		name: "Test Room",
		slug: "test-room",
	})

	const sceneId = await ownerConvex.mutation(api.scenes.create, {
		name: "Test Scene",
		roomId,
		mode: "battlemap",
	})

	const characterId = await ownerConvex.mutation(api.characters.create, {
		name: "Test Character",
		roomId,
		attributes: { strength: 3, sense: 2, mobility: 4, intellect: 3, wit: 2 },
	})

	await expect(
		nonOwnerConvex.mutation(api.tokens.create, {
			inputs: [
				{
					sceneId,
					characterId,
					position: { x: 100, y: 200 },
					visible: true,
				},
			],
		}),
	).rejects.toThrow(ConvexError)
})

test("non-owner can only update position of token", async () => {
	const convex = createConvexTest()
	const ownerConvex = await createConvexTestWithIdentity(convex)
	const nonOwnerConvex = await createConvexTestWithIdentity(convex)

	const roomId = await ownerConvex.mutation(api.rooms.create, {
		name: "Test Room",
		slug: "test-room",
	})

	const sceneId = await ownerConvex.mutation(api.scenes.create, {
		name: "Test Scene",
		roomId,
		mode: "battlemap",
	})

	const characterId = await ownerConvex.mutation(api.characters.create, {
		name: "Test Character",
		roomId,
		attributes: { strength: 3, sense: 2, mobility: 4, intellect: 3, wit: 2 },
	})

	await ownerConvex.mutation(api.tokens.create, {
		inputs: [
			{
				sceneId,
				characterId,
				position: { x: 100, y: 200 },
				visible: true,
			},
		],
	})

	const token = await ownerConvex.query(api.tokens.get, {
		characterId,
		sceneId,
	})

	await nonOwnerConvex.mutation(api.tokens.update, {
		updates: [
			{
				tokenId: token!._id,
				position: { x: 300, y: 400 },
				visible: false, // This should be ignored
			},
		],
	})

	const updatedToken = await ownerConvex.query(api.tokens.get, {
		characterId,
		sceneId,
	})

	expect(updatedToken).toMatchObject({
		position: { x: 300, y: 400 },
		visible: true, // Should remain unchanged
	})
})

test("non-owner cannot remove token", async () => {
	const convex = createConvexTest()
	const ownerConvex = await createConvexTestWithIdentity(convex)
	const nonOwnerConvex = await createConvexTestWithIdentity(convex)

	const roomId = await ownerConvex.mutation(api.rooms.create, {
		name: "Test Room",
		slug: "test-room",
	})

	const sceneId = await ownerConvex.mutation(api.scenes.create, {
		name: "Test Scene",
		roomId,
		mode: "battlemap",
	})

	const characterId = await ownerConvex.mutation(api.characters.create, {
		name: "Test Character",
		roomId,
		attributes: { strength: 3, sense: 2, mobility: 4, intellect: 3, wit: 2 },
	})

	await ownerConvex.mutation(api.tokens.create, {
		inputs: [
			{
				sceneId,
				characterId,
				position: { x: 100, y: 200 },
				visible: true,
			},
		],
	})

	const token = await ownerConvex.query(api.tokens.get, {
		characterId,
		sceneId,
	})

	await expect(
		nonOwnerConvex.mutation(api.tokens.remove, {
			tokenIds: [token!._id],
		}),
	).rejects.toThrow(ConvexError)
})
