import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { ComponentProps } from "react"
import { Button } from "~/components/Button.tsx"
import { FormButton } from "~/components/FormButton.tsx"
import { api } from "~/convex/_generated/api.js"
import { useActiveSceneContext } from "~/features/scenes/context.ts"
import { NormalizedCharacter } from "../../../convex/characters.ts"
import { useBattleMapStageInfo } from "../battlemap/context.ts"
import { useRoomContext } from "../rooms/context.tsx"

export function CharacterToggleTokenButton({
	characters,
	...props
}: {
	characters: NormalizedCharacter[]
} & ComponentProps<typeof Button>) {
	const room = useRoomContext()

	const scene = useActiveSceneContext()
	const sceneTokens =
		useQuery(api.tokens.list, scene ? { sceneId: scene._id } : "skip") ?? []

	const addTokens = useMutation(api.tokens.create)
	const removeTokens = useMutation(api.tokens.remove)

	const stageInfo = useBattleMapStageInfo()

	if (!scene || !room.isOwner) {
		return null
	}

	const sceneCharacterIds = new Set(sceneTokens?.map((it) => it.characterId))

	const characterIds = characters.map((it) => it._id)
	const inScene = characterIds.filter((id) => sceneCharacterIds.has(id))
	const outOfScene = characterIds.filter((id) => !sceneCharacterIds.has(id))

	const addTokensAction = async () => {
		await addTokens({
			inputs: outOfScene.map((characterId) => ({
				sceneId: scene._id,
				characterId,
				position: stageInfo.current.getViewportCenter(),
			})),
		})
	}

	const removeTokensAction = async () => {
		const inSceneSet = new Set(inScene)
		await removeTokens({
			tokenIds: sceneTokens
				.filter((it) => it.characterId && inSceneSet.has(it.characterId))
				.map((it) => it._id),
		})
	}

	return (
		<>
			{outOfScene.length > 0 && (
				<FormButton
					action={addTokensAction}
					icon={<Lucide.ImagePlus />}
					{...props}
				>
					Add to scene
				</FormButton>
			)}
			{inScene.length > 0 && (
				<FormButton
					action={removeTokensAction}
					icon={<Lucide.ImageOff />}
					{...props}
				>
					Remove from scene
				</FormButton>
			)}
		</>
	)
}
