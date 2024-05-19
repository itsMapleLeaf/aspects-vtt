import * as Lucide from "lucide-react"
import {
	ContextMenu,
	ContextMenuItem,
	ContextMenuPanel,
	ContextMenuTrigger,
} from "../../ui/ContextMenu.tsx"
import {
	ModalPanel,
	ModalPanelContent,
	ModalProvider,
} from "../../ui/Modal.tsx"
import type { ApiCharacter } from "../characters/types.ts"
import { ContestedRollForm } from "./ContestedRollForm.tsx"

export function CharacterContextMenu(props: {
	character: ApiCharacter
	children?: React.ReactNode
}) {
	return (
		<ModalProvider>
			{(store) => (
				<ContextMenu>
					<ContextMenuTrigger className="absolute inset-0 size-full">
						{props.children}
					</ContextMenuTrigger>
					<ContextMenuPanel>
						<ContextMenuItem
							icon={<Lucide.Swords />}
							text="Contested roll..."
							onClick={store.show}
						/>
					</ContextMenuPanel>
					<ModalPanel
						title={
							<>
								<span className="opacity-50">Contested Roll vs.</span>{" "}
								{props.character.displayName}
							</>
						}
					>
						<ModalPanelContent>
							<ContestedRollForm
								opponent={props.character}
								onRoll={() => store.hide()}
							/>
						</ModalPanelContent>
					</ModalPanel>
				</ContextMenu>
			)}
		</ModalProvider>
	)
}
