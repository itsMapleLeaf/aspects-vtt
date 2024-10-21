import { ConvexError } from "convex/values"
import { expect, test } from "vitest"
import { ensure } from "../shared/errors.ts"
import { api } from "./_generated/api"
import {
	createConvexTest,
	createConvexTestWithIdentity,
} from "./testing/helpers"

async function setupTestEnvironment() {
	const convex = createConvexTest()
	const ownerConvex = await createConvexTestWithIdentity(convex)

	const roomId = await ownerConvex.mutation(api.rooms.create, {
		name: "Test Room",
		slug: "test-room",
	})

	return { convex, ownerConvex, roomId }
}

test("create and get character", async () => {
	const { ownerConvex, roomId } = await setupTestEnvironment()

	const characterId = await ownerConvex.mutation(api.characters.create, {
		name: "Test Character",
		roomId,
		attributes: { strength: 3, sense: 2, mobility: 4, intellect: 3, wit: 2 },
	})

	const character = await ownerConvex.query(api.characters.get, { characterId })

	expect(character).toMatchObject({
		full: {
			name: "Test Character",
			roomId,
			attributes: { strength: 3, sense: 2, mobility: 4, intellect: 3, wit: 2 },
		},
	})
})

test("list characters", async () => {
	const { ownerConvex, roomId } = await setupTestEnvironment()

	await ownerConvex.mutation(api.characters.create, {
		name: "Character 1",
		roomId,
		attributes: { strength: 1, sense: 1, mobility: 1, intellect: 1, wit: 1 },
	})

	await ownerConvex.mutation(api.characters.create, {
		name: "Character 2",
		roomId,
		attributes: { strength: 2, sense: 2, mobility: 2, intellect: 2, wit: 2 },
	})

	const characters = await ownerConvex.query(api.characters.list, { roomId })

	expect(characters).toHaveLength(2)
	expect(characters[0]?.full?.name).toBe("Character 1")
	expect(characters[1]?.full?.name).toBe("Character 2")
})

test("update character", async () => {
	const { ownerConvex, roomId } = await setupTestEnvironment()

	const characterId = await ownerConvex.mutation(api.characters.create, {
		name: "Original Name",
		roomId,
		attributes: { strength: 1, sense: 1, mobility: 1, intellect: 1, wit: 1 },
	})

	await ownerConvex.mutation(api.characters.update, {
		characterId,
		name: "Updated Name",
		attributes: { strength: 2, sense: 2, mobility: 2, intellect: 2, wit: 2 },
	})

	const updatedCharacter = await ownerConvex.query(api.characters.get, {
		characterId,
	})

	expect(updatedCharacter?.full).toMatchObject({
		name: "Updated Name",
		attributes: { strength: 2, sense: 2, mobility: 2, intellect: 2, wit: 2 },
	})
})

test("remove character", async () => {
	const { ownerConvex, roomId } = await setupTestEnvironment()

	const characterId = await ownerConvex.mutation(api.characters.create, {
		name: "To Be Removed",
		roomId,
		attributes: { strength: 1, sense: 1, mobility: 1, intellect: 1, wit: 1 },
	})

	await ownerConvex.mutation(api.characters.remove, {
		characterIds: [characterId],
	})

	const removedCharacter = await ownerConvex.query(api.characters.get, {
		characterId,
	})

	expect(removedCharacter).toBeNull()
})

test("duplicate character", async () => {
	const { ownerConvex, roomId } = await setupTestEnvironment()

	const originalCharacterId = await ownerConvex.mutation(
		api.characters.create,
		{
			name: "Original Character",
			roomId,
			attributes: { strength: 3, sense: 3, mobility: 3, intellect: 3, wit: 3 },
		},
	)

	const [duplicatedCharacterId] = await ownerConvex.mutation(
		api.characters.duplicate,
		{
			characterIds: [originalCharacterId],
		},
	)

	const duplicatedCharacter = await ownerConvex.query(api.characters.get, {
		characterId: ensure(duplicatedCharacterId),
	})

	expect(duplicatedCharacter?.full).toMatchObject({
		name: "Original Character",
		roomId,
		attributes: { strength: 3, sense: 3, mobility: 3, intellect: 3, wit: 3 },
	})
	expect(duplicatedCharacter?.full?._id).not.toBe(originalCharacterId)
})

test("non-owner cannot see full character details", async () => {
	const { convex, ownerConvex, roomId } = await setupTestEnvironment()

	const characterId = await ownerConvex.mutation(api.characters.create, {
		name: "Hidden Character",
		roomId,
		attributes: { strength: 1, sense: 1, mobility: 1, intellect: 1, wit: 1 },
		visible: false,
	})

	const nonOwnerConvex = await createConvexTestWithIdentity(convex)

	const character = await nonOwnerConvex.query(api.characters.get, {
		characterId,
	})

	expect(character).toBeNull()
})

test("non-owner can see visible character but not full details", async () => {
	const { convex, ownerConvex, roomId } = await setupTestEnvironment()

	const characterId = await ownerConvex.mutation(api.characters.create, {
		name: "Visible Character",
		roomId,
		attributes: { strength: 1, sense: 1, mobility: 1, intellect: 1, wit: 1 },
		visible: true,
		nameVisible: true,
	})

	const nonOwnerConvex = await createConvexTestWithIdentity(convex)

	const character = await nonOwnerConvex.query(api.characters.get, {
		characterId,
	})

	expect(character).not.toBeNull()
	expect(character?.identity?.name).toBe("Visible Character")
	expect(character?.full).toBeUndefined()
})

test("non-owner cannot update character", async () => {
	const { convex, ownerConvex, roomId } = await setupTestEnvironment()

	const characterId = await ownerConvex.mutation(api.characters.create, {
		name: "Protected Character",
		roomId,
		attributes: { strength: 1, sense: 1, mobility: 1, intellect: 1, wit: 1 },
	})

	const nonOwnerConvex = await createConvexTestWithIdentity(convex)

	await expect(
		nonOwnerConvex.mutation(api.characters.update, {
			characterId,
			name: "Hacked Character",
		}),
	).rejects.toThrow(ConvexError)
})

test("non-owner cannot remove character", async () => {
	const { convex, ownerConvex, roomId } = await setupTestEnvironment()

	const characterId = await ownerConvex.mutation(api.characters.create, {
		name: "Protected Character",
		roomId,
		attributes: { strength: 1, sense: 1, mobility: 1, intellect: 1, wit: 1 },
	})

	const nonOwnerConvex = await createConvexTestWithIdentity(convex)

	await expect(
		nonOwnerConvex.mutation(api.characters.remove, {
			characterIds: [characterId],
		}),
	).rejects.toThrow(ConvexError)
})

test("room owner can see and modify all characters", async () => {
	const {
		convex,
		ownerConvex: roomOwnerConvex,
		roomId,
	} = await setupTestEnvironment()

	const characterId = await roomOwnerConvex.mutation(api.characters.create, {
		name: "Room Owner's Character",
		roomId,
		attributes: { strength: 1, sense: 1, mobility: 1, intellect: 1, wit: 1 },
		visible: false,
	})

	const otherConvex = await createConvexTestWithIdentity(convex)
	const otherCharacterId = await otherConvex.mutation(api.characters.create, {
		name: "Other's Character",
		roomId,
		attributes: { strength: 1, sense: 1, mobility: 1, intellect: 1, wit: 1 },
		visible: false,
	})

	const roomOwnerView = await roomOwnerConvex.query(api.characters.get, {
		characterId: otherCharacterId,
	})
	expect(roomOwnerView?.full).not.toBeUndefined()

	await expect(
		roomOwnerConvex.mutation(api.characters.update, {
			characterId: otherCharacterId,
			name: "Modified by Room Owner",
		}),
	).resolves.not.toThrow()
})
