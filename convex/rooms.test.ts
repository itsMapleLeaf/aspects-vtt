import { expect, test } from "bun:test"
import { ConvexError } from "convex/values"
import type { Id } from "./_generated/dataModel"
import { createMockMutationCtx } from "./lib/testing.ts"
import { updateCombat } from "./rooms.ts"

async function setupTestRoom() {
	const mutationCtx = createMockMutationCtx()

	const roomId = await mutationCtx.db.insert("rooms", {
		name: "Test Room",
		slug: "test-room",
		ownerId: "user1" as Id<"users">,
		combat: null,
	})

	const character1Id = await mutationCtx.db.insert("characters", {
		name: "Character 1",
		roomId,
		ownerId: "user1" as Id<"users">,
		// @ts-expect-error
		attributes: { mobility: 5 },
		resolveMax: 10,
	})

	const character2Id = await mutationCtx.db.insert("characters", {
		name: "Character 2",
		roomId,
		ownerId: "user1" as Id<"users">,
		// @ts-expect-error
		attributes: { mobility: 3 },
		resolveMax: 8,
	})

	return { mutationCtx, roomId, character1Id, character2Id }
}

test("start", async () => {
	const { mutationCtx, roomId } = await setupTestRoom()

	await updateCombat(mutationCtx, {
		roomId,
		action: { type: "start" },
	})

	const updatedRoom = await mutationCtx.db.get(roomId)
	expect(updatedRoom?.combat).toEqual({
		memberIds: [],
		currentMemberId: undefined,
	})
})

test("addMembers", async () => {
	const { mutationCtx, roomId, character1Id, character2Id } =
		await setupTestRoom()

	await updateCombat(mutationCtx, {
		roomId,
		action: { type: "start" },
	})

	await updateCombat(mutationCtx, {
		roomId,
		action: { type: "addMembers", memberIds: [character1Id, character2Id] },
	})

	const updatedRoom = await mutationCtx.db.get(roomId)
	expect(updatedRoom?.combat?.memberIds).toEqual([character1Id, character2Id])
})

test("setCurrentMember", async () => {
	const { mutationCtx, roomId, character1Id, character2Id } =
		await setupTestRoom()

	await updateCombat(mutationCtx, {
		roomId,
		action: { type: "start" },
	})

	await updateCombat(mutationCtx, {
		roomId,
		action: { type: "addMembers", memberIds: [character1Id, character2Id] },
	})

	await updateCombat(mutationCtx, {
		roomId,
		action: { type: "setCurrentMember", memberId: character1Id },
	})

	const updatedRoom = await mutationCtx.db.get(roomId)
	expect(updatedRoom?.combat?.currentMemberId).toBe(character1Id)
})

test("advance", async () => {
	const { mutationCtx, roomId, character1Id, character2Id } =
		await setupTestRoom()

	await updateCombat(mutationCtx, {
		roomId,
		action: { type: "start" },
	})

	await updateCombat(mutationCtx, {
		roomId,
		action: { type: "addMembers", memberIds: [character1Id, character2Id] },
	})

	await updateCombat(mutationCtx, {
		roomId,
		action: { type: "setCurrentMember", memberId: character1Id },
	})

	await updateCombat(mutationCtx, {
		roomId,
		action: { type: "advance" },
	})

	const updatedRoom = await mutationCtx.db.get(roomId)
	expect(updatedRoom?.combat?.currentMemberId).toBe(character2Id)
})

test("removeMembers", async () => {
	const { mutationCtx, roomId, character1Id, character2Id } =
		await setupTestRoom()

	await updateCombat(mutationCtx, {
		roomId,
		action: { type: "start" },
	})

	await updateCombat(mutationCtx, {
		roomId,
		action: { type: "addMembers", memberIds: [character1Id, character2Id] },
	})

	await updateCombat(mutationCtx, {
		roomId,
		action: { type: "removeMembers", memberIds: [character2Id] },
	})

	const updatedRoom = await mutationCtx.db.get(roomId)
	expect(updatedRoom?.combat?.memberIds).toEqual([character1Id])
})

test("stop", async () => {
	const { mutationCtx, roomId, character1Id, character2Id } =
		await setupTestRoom()

	await updateCombat(mutationCtx, {
		roomId,
		action: { type: "start" },
	})

	await updateCombat(mutationCtx, {
		roomId,
		action: { type: "addMembers", memberIds: [character1Id, character2Id] },
	})

	await updateCombat(mutationCtx, {
		roomId,
		action: { type: "stop" },
	})

	const updatedRoom = await mutationCtx.db.get(roomId)
	expect(updatedRoom?.combat).toBeNull()
})

test.each([
	{ type: "addMembers" as const, memberIds: [] },
	{ type: "setCurrentMember" as const, memberId: "" },
	{ type: "advance" as const, memberIds: [] },
	{ type: "removeMembers" as const, memberIds: [] },
	{ type: "stop" as const },
])("throws on invalid state", async () => {
	const { mutationCtx, roomId, character1Id, character2Id } =
		await setupTestRoom()

	await expect(
		updateCombat(mutationCtx, {
			roomId,
			action: { type: "addMembers", memberIds: [character1Id, character2Id] },
		}),
	).rejects.toBeInstanceOf(ConvexError)
})
