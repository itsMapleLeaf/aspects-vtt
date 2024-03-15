import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { Button } from "#app/ui/Button.tsx"
import { Modal, ModalActions, ModalButton, ModalDismiss, ModalPanel } from "#app/ui/Modal.tsx"
import { api } from "#convex/_generated/api.js"
import type { Doc } from "#convex/_generated/dataModel.js"
import { getCharacterIdentifier } from "./characterFields.tsx"

export function DeleteCharacterButton({
	character,
}: {
	character: Doc<"characters">
}) {
	const remove = useMutation(api.characters.remove)
	return (
		<Modal>
			{(store) => (
				<>
					<Button icon={<Lucide.Trash />} element={<ModalButton title="Delete Character" />} />
					<ModalPanel title="Delete Character">
						<p>
							Are you sure you want to delete <strong>{getCharacterIdentifier(character)}</strong>?
							This cannot be undone!
						</p>
						<ModalActions>
							<Button icon={<Lucide.X />} text="No, keep character" element={<ModalDismiss />} />
							<Button
								icon={<Lucide.Trash />}
								text={`Yes, delete ${getCharacterIdentifier(character)}`}
								onClick={async () => {
									await remove({ id: character._id })
									store.hide()
								}}
								className="border-red-600/40 bg-red-600/30 active:before:bg-red-500/30 before:bg-red-600/30 hover:text-red-100"
							/>
						</ModalActions>
					</ModalPanel>
				</>
			)}
		</Modal>
	)
}
