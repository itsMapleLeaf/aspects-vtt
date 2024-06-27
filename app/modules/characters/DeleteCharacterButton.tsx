import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { ConfirmModalButton } from "~/ui/ConfirmModalButton.tsx"
import { api } from "../../../convex/_generated/api.js"
import type { Id } from "../../../convex/_generated/dataModel.js"
import { Button } from "../../ui/Button.tsx"

export function DeleteCharacterButton({
	character,
	text,
}: {
	character: { _id: Id<"characters">; name?: string }
	text?: string
}) {
	const remove = useMutation(api.characters.functions.remove)
	return (
		<ConfirmModalButton
			title="Delete character"
			message={
				<p>
					Are you sure you want to delete{" "}
					{character.name ?
						<strong>{character.name}</strong>
					:	"this character"}
					? <strong>This cannot be undone!</strong>
				</p>
			}
			confirmText={`Yes, delete ${character.name ?? "this character"}`}
			confirmIcon={<Lucide.Trash />}
			cancelText="No, keep character"
			cancelIcon={<Lucide.X />}
			onConfirm={async () => await remove({ id: character._id })}
			render={<Button icon={<Lucide.Trash />} text={text} />}
		/>
	)
}
