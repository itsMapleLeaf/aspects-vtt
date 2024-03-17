import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { randomItem } from "#app/common/random.js"
import { useCurrentCharacterId } from "#app/features/characters/useCurrentCharacterId.ts"
import { Button } from "#app/ui/Button.tsx"
import { api } from "#convex/_generated/api.js"
import { useRoom } from "../rooms/roomContext.tsx"
import { characterNames } from "./characterNames.ts"

export function CreateCharacterButton() {
	const room = useRoom()
	const create = useMutation(api.characters.create)
	const [, setCurrentCharacterId] = useCurrentCharacterId()
	return (
		<Button
			icon={<Lucide.Plus />}
			title="Add Character"
			onClick={async () => {
				const dice: [number, number, number, number, number] = [4, 6, 8, 12, 20]
				dice.sort()
				const [strength, sense, mobility, intellect, wit] = dice

				const id = await create({
					roomId: room._id,
					fields: [
						{ key: "name", value: randomItem(characterNames) ?? "Cute Felirian" },
						{ key: "health", value: strength * 2 },
						{ key: "health:max", value: strength * 2 },
						{ key: "fatigue", value: 0 },
						{ key: "strength", value: strength },
						{ key: "sense", value: sense },
						{ key: "mobility", value: mobility },
						{ key: "intellect", value: intellect },
						{ key: "wit", value: wit },
					],
				})

				setCurrentCharacterId(id)
			}}
		/>
	)
}
