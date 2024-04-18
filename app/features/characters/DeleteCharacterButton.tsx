import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { Button } from "#app/ui/Button.tsx"
import { Modal, ModalActions, ModalButton, ModalDismiss, ModalPanel } from "#app/ui/Modal.tsx"
import { api } from "#convex/_generated/api.js"
import type { Id } from "#convex/_generated/dataModel.js"

export function DeleteCharacterButton({
	character,
	text,
}: {
	character: { _id: Id<"characters">; name: string }
	text?: string
}) {
	const remove = useMutation(api.characters.remove)
	return (
		<Modal>
			{(store) => (
				<>
					<Button
						icon={<Lucide.Trash />}
						text={text}
						element={<ModalButton title="Delete Character" />}
					/>
					<ModalPanel
						title="Delete Character"
						className="grid place-items-center gap-2 text-pretty p-2 text-center"
					>
						<p>
							Are you sure you want to delete <strong>{character.name}</strong>? This cannot be
							undone!
						</p>
						<ModalActions>
							<Button icon={<Lucide.X />} text="No, keep character" element={<ModalDismiss />} />
							<Button
								icon={<Lucide.Trash />}
								text={`Yes, delete ${character.name}`}
								onClick={async () => {
									await remove({ id: character._id })
									store.hide()
								}}
								className="border-red-600/40 bg-red-600/30 before:bg-red-600/30 hover:text-red-100 active:before:bg-red-500/30"
							/>
						</ModalActions>
					</ModalPanel>
				</>
			)}
		</Modal>
	)
}
