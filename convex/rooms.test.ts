import { ConvexError } from "convex/values"
import { expect, test } from "vitest"
import { api } from "./_generated/api"
import { Id } from "./_generated/dataModel"
import { createConvexTestWithIdentity } from "./testing/helpers"

async function setupTestRoom() {
	const convex = await createConvexTestWithIdentity()

	const roomId = await convex.mutation(api.rooms.create, {
		name: "Test Room",
		slug: "test-room",
	})

	const character1Id = await convex.mutation(api.characters.create, {
		name: "Character 1",
		roomId,
		attributes: { strength: 1, sense: 1, mobility: 5, intellect: 1, wit: 1 },
	})

	const character2Id = await convex.mutation(api.characters.create, {
		name: "Character 2",
		roomId,
		attributes: { strength: 1, sense: 1, mobility: 3, intellect: 1, wit: 1 },
	})

	return { convex, roomId, character1Id, character2Id }
}

test("start", async () => {
	const { convex, roomId } = await setupTestRoom()

	await convex.mutation(api.rooms.updateCombat, {
		roomId,
		action: { type: "start" },
	})

	const updatedRoom = await convex.query(api.rooms.get, { id: roomId })
	expect(updatedRoom?.combat).toEqual({
		memberIds: [],
		currentMemberId: undefined,
	})
})

test("addMembers", async () => {
	const { convex, roomId, character1Id, character2Id } = await setupTestRoom()

	await convex.mutation(api.rooms.updateCombat, {
		roomId,
		action: { type: "start" },
	})

	await convex.mutation(api.rooms.updateCombat, {
		roomId,
		action: { type: "addMembers", memberIds: [character1Id, character2Id] },
	})

	const updatedRoom = await convex.query(api.rooms.get, { id: roomId })
	expect(updatedRoom?.combat?.memberIds).toEqual([character1Id, character2Id])
})

test("setCurrentMember", async () => {
	const { convex, roomId, character1Id, character2Id } = await setupTestRoom()

	await convex.mutation(api.rooms.updateCombat, {
		roomId,
		action: { type: "start" },
	})

	await convex.mutation(api.rooms.updateCombat, {
		roomId,
		action: { type: "addMembers", memberIds: [character1Id, character2Id] },
	})

	await convex.mutation(api.rooms.updateCombat, {
		roomId,
		action: { type: "setCurrentMember", memberId: character1Id },
	})

	const updatedRoom = await convex.query(api.rooms.get, { id: roomId })
	expect(updatedRoom?.combat?.currentMemberId).toBe(character1Id)
})

test("advance", async () => {
	const { convex, roomId, character1Id, character2Id } = await setupTestRoom()

	await convex.mutation(api.rooms.updateCombat, {
		roomId,
		action: { type: "start" },
	})

	await convex.mutation(api.rooms.updateCombat, {
		roomId,
		action: { type: "addMembers", memberIds: [character1Id, character2Id] },
	})

	await convex.mutation(api.rooms.updateCombat, {
		roomId,
		action: { type: "setCurrentMember", memberId: character1Id },
	})

	await convex.mutation(api.rooms.updateCombat, {
		roomId,
		action: { type: "advance" },
	})

	const updatedRoom = await convex.query(api.rooms.get, { id: roomId })
	expect(updatedRoom?.combat?.currentMemberId).toBe(character2Id)
})

test("removeMembers", async () => {
	const { convex, roomId, character1Id, character2Id } = await setupTestRoom()

	await convex.mutation(api.rooms.updateCombat, {
		roomId,
		action: { type: "start" },
	})

	await convex.mutation(api.rooms.updateCombat, {
		roomId,
		action: { type: "addMembers", memberIds: [character1Id, character2Id] },
	})

	await convex.mutation(api.rooms.updateCombat, {
		roomId,
		action: { type: "removeMembers", memberIds: [character2Id] },
	})

	const updatedRoom = await convex.query(api.rooms.get, { id: roomId })
	expect(updatedRoom?.combat?.memberIds).toEqual([character1Id])
})

test("stop", async () => {
	const { convex, roomId, character1Id, character2Id } = await setupTestRoom()

	await convex.mutation(api.rooms.updateCombat, {
		roomId,
		action: { type: "start" },
	})

	await convex.mutation(api.rooms.updateCombat, {
		roomId,
		action: { type: "addMembers", memberIds: [character1Id, character2Id] },
	})

	await convex.mutation(api.rooms.updateCombat, {
		roomId,
		action: { type: "stop" },
	})

	const updatedRoom = await convex.query(api.rooms.get, { id: roomId })
	expect(updatedRoom?.combat).toBeNull()
})

test.each([
	{ type: "addMembers" as const, memberIds: [] },
	{ type: "setCurrentMember" as const, memberId: "" as Id<"characters"> },
	{ type: "advance" as const, memberIds: [] },
	{ type: "removeMembers" as const, memberIds: [] },
	{ type: "stop" as const },
])("throws on invalid state", async (action) => {
	const { convex, roomId } = await setupTestRoom()

	await expect(
		convex.mutation(api.rooms.updateCombat, {
			roomId,
			action,
		}),
	).rejects.toBeInstanceOf(ConvexError)
})
