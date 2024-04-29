import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { api } from "../../../convex/_generated/api.js"
import type { Id } from "../../../convex/_generated/dataModel.js"
import { Button } from "../../ui/Button.tsx"
import {
	Modal,
	ModalActions,
	ModalButton,
	ModalDismiss,
	ModalPanel,
	ModalPanelContent,
} from "../../ui/Modal.tsx"

export function DeleteCharacterButton({
	character,
	text,
}: {
	character: { _id: Id<"characters">; displayName: string }
	text?: string
}) {
	const remove = useMutation(api.characters.remove)
	return (
		<Modal>
			{(store) => (
				<>
					<Button icon={<Lucide.Trash />} text={text} element={<ModalButton title="Delete" />} />
					<ModalPanel title="Delete Character">
						<ModalPanelContent className="grid place-items-center gap-2 text-pretty p-2 text-center">
							<p>
								Are you sure you want to delete <strong>{character.displayName}</strong>? This
								cannot be undone!
							</p>
							<ModalActions>
								<Button icon={<Lucide.X />} text="No, keep character" element={<ModalDismiss />} />
								<Button
									icon={<Lucide.Trash />}
									text={`Yes, delete ${character.displayName}`}
									onClick={async () => {
										await remove({ id: character._id })
										store.hide()
									}}
									className="border-red-600/40 bg-red-600/30 before:bg-red-600/30 hover:text-red-100 active:before:bg-red-500/30"
								/>
							</ModalActions>
						</ModalPanelContent>
					</ModalPanel>
				</>
			)}
		</Modal>
	)
}
