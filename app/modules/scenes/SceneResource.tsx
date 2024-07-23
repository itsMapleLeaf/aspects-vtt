import { LucideImage, LucideImagePlay } from "lucide-react"
import { useState } from "react"
import { z } from "zod"
import { defineResource, type Resource } from "~/modules/resources/Resource"
import { Button } from "~/ui/Button.tsx"
import type { Id } from "../../../convex/_generated/dataModel"
import { useRoom } from "../rooms/roomContext.tsx"
import { SceneEditorModal } from "./SceneEditor.tsx"
import type { ApiScene } from "./types.ts"

export interface SceneResource extends Resource {
	readonly dragData: { sceneId: Id<"scenes"> }
}

export const SceneResource = defineResource({
	name: "SceneResource",

	dragDataSchema: z.object({
		sceneId: z.custom<Id<"scenes">>((input) => typeof input === "string"),
	}),

	create: (scene: ApiScene) => ({
		id: scene._id,
		name: scene.name,
		dragData: { sceneId: scene._id },
	}),

	TreeItem: ({ scene }: { scene: ApiScene }) => <SceneTreeElement scene={scene} />,
})

function SceneTreeElement({ scene }: { scene: ApiScene }) {
	const room = useRoom()
	const isCurrent = room.currentScene === scene._id
	const [open, setOpen] = useState(false)

	return (
		<SceneEditorModal open={open} setOpen={setOpen} scene={scene}>
			<SceneEditorModal.Button
				render={
					<Button
						text={scene.name}
						icon={isCurrent ? <LucideImagePlay /> : <LucideImage />}
						appearance="clear"
						active={isCurrent}
						className="w-full justify-start"
					/>
				}
			/>
		</SceneEditorModal>
	)
}
