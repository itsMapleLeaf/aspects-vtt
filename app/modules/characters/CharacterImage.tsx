import { LucideGhost } from "lucide-react"
import type { ComponentProps } from "react"
import type { Nullish, StrictOmit } from "~/helpers/types.ts"
import type { Id } from "../../../convex/_generated/dataModel"
import { ApiImage } from "../api-images/ApiImage.tsx"

export function CharacterImage({
	character,
	...props
}: {
	character: {
		_id: Id<"characters">
		image?: Nullish<Id<"images">>
		race?: Nullish<string>
	}
} & StrictOmit<ComponentProps<typeof ApiImage>, "imageId">) {
	return <ApiImage imageId={character.image} fallback={<LucideGhost />} {...props} />
}
