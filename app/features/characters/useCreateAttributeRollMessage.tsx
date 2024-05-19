import { useMutation } from "convex/react"
import { ConvexError } from "convex/values"
import { useCallback } from "react"
import { api } from "../../../convex/_generated/api.js"
import { expect } from "../../common/expect.ts"
import {
	boostDiceKind,
	getDiceKindApiInput,
	snagDiceKind,
	statDiceKinds,
} from "../dice/diceKinds.tsx"
import { useRoom } from "../rooms/roomContext.tsx"

export function useCreateAttributeRollMessage() {
	const createMessage = useMutation(api.messages.functions.create)
	const room = useRoom()
	return useCallback(
		async (args: {
			content?: string
			attributeValue: number
			boostCount?: number
			snagCount?: number
		}) => {
			const attributeDie = expect(
				statDiceKinds.find((kind) => kind.faces.length === args.attributeValue),
				`couldn't find a d${args.attributeValue} dice kind`,
			)

			try {
				return await createMessage({
					roomId: room._id,
					content: args.content,
					dice: [
						getDiceKindApiInput(attributeDie, 1),
						getDiceKindApiInput(boostDiceKind, args.boostCount ?? 0),
						getDiceKindApiInput(snagDiceKind, args.snagCount ?? 0),
					],
				})
			} catch (error) {
				alert(
					error instanceof ConvexError ?
						error.message
					:	"Something went wrong, try again.",
				)
			}
		},
		[createMessage, room._id],
	)
}
