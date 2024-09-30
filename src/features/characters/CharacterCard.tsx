import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { Avatar } from "~/components/Avatar.tsx"
import { Button } from "~/components/Button.tsx"
import { Collapse } from "~/components/Collapse.tsx"
import { Heading } from "~/components/Heading.tsx"
import { ToastActionForm } from "~/components/ToastActionForm.tsx"
import { api } from "~/convex/_generated/api.js"
import { type ProtectedCharacter } from "~/convex/characters.ts"
import { interactivePanel } from "~/styles/panel.ts"
import { secondaryHeading } from "~/styles/text.ts"
import { getImageUrl } from "../images/getImageUrl.ts"
import { useRoomContext } from "../rooms/context.tsx"
import { CharacterAttributeButtonRow } from "./CharacterAttributeButtonRow.tsx"
import {
	CharacterEditorDialog,
	CharacterEditorDialogButton,
} from "./CharacterEditorDialog.tsx"
import { CharacterPlayerSelect } from "./CharacterPlayerSelect.tsx"
import { CharacterToggleCombatMemberButton } from "./CharacterToggleCombatMemberButton.tsx"
import { CharacterVitalFields } from "./CharacterVitalFields.tsx"

export function CharacterCard({
	character,
}: {
	character: ProtectedCharacter
}) {
	const room = useRoomContext()
	const removeCharacter = useMutation(api.characters.remove)
	return (
		<div>
			<Collapse>
				<Collapse.Button
					className={interactivePanel(
						"group flex w-full items-center p-2 text-start gap-2",
					)}
				>
					<Avatar
						src={
							character.public.imageId
								? getImageUrl(character.public.imageId)
								: undefined
						}
						className="size-12"
					/>
					<div>
						<Heading className={secondaryHeading("leading-none empty:hidden")}>
							{character.identity?.name}
						</Heading>
						<p className="mt-1 text-sm font-semibold leading-none tracking-wide text-primary-300 empty:hidden">
							{[character.public.race, character.identity?.pronouns]
								.filter(Boolean)
								.join(" • ")}
						</p>
					</div>
					<Lucide.ChevronLeft className="ml-auto transition-transform group-aria-expanded:-rotate-90" />
				</Collapse.Button>

				<Collapse.Content>
					<div className="flex flex-col py-2 gap-2">
						{character.full && (
							<CharacterAttributeButtonRow character={character.full} />
						)}
						{character.full && (
							<CharacterVitalFields character={character.full} />
						)}
						{character.full && (
							<CharacterPlayerSelect character={character.full} />
						)}
						{character.full && (
							<div className="grid auto-cols-fr grid-flow-col gap">
								<CharacterEditorDialog character={character.full}>
									<CharacterEditorDialogButton
										render={
											<Button icon={<Lucide.Edit className="size-5" />}>
												Edit
											</Button>
										}
									></CharacterEditorDialogButton>
								</CharacterEditorDialog>
								{room.isOwner && (
									<ToastActionForm
										className="contents"
										action={() =>
											removeCharacter({
												characterIds: [character.public._id],
											})
										}
									>
										<Button
											type="submit"
											icon={<Lucide.Trash className="size-5" />}
										>
											Delete
										</Button>
									</ToastActionForm>
								)}
							</div>
						)}
						<CharacterToggleCombatMemberButton
							characterIds={[character.public._id]}
						/>
					</div>
				</Collapse.Content>
			</Collapse>
		</div>
	)
}
