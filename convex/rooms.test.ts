import { expect, test } from "bun:test"
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

test("updateCombat starts combat correctly", async () => {
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

test("updateCombat adds members correctly", async () => {
	const { mutationCtx, roomId, character1Id, character2Id } =
		await setupTestRoom()

	await updateCombat(mutationCtx, {
		roomId,
		action: { type: "addMembers", memberIds: [character1Id, character2Id] },
	})

	const updatedRoom = await mutationCtx.db.get(roomId)
	expect(updatedRoom?.combat?.memberIds).toEqual([character1Id, character2Id])
})

test("updateCombat sets current member correctly", async () => {
	const { mutationCtx, roomId, character1Id, character2Id } =
		await setupTestRoom()

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

test("updateCombat advances turn correctly", async () => {
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

test("updateCombat removes members correctly", async () => {
	const { mutationCtx, roomId, character1Id, character2Id } =
		await setupTestRoom()

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

test("updateCombat stops combat correctly", async () => {
	const { mutationCtx, roomId, character1Id, character2Id } =
		await setupTestRoom()

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
