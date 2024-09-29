import * as Lucide from "lucide-react"
import { Avatar } from "~/components/Avatar.tsx"
import { Button } from "~/components/Button.tsx"
import { Collapse } from "~/components/Collapse.tsx"
import { Heading } from "~/components/Heading.tsx"
import { type ProtectedCharacter } from "~/convex/characters.ts"
import { interactivePanel } from "~/styles/panel.ts"
import { secondaryHeading } from "~/styles/text.ts"
import { getImageUrl } from "../images/getImageUrl.ts"
import { CharacterAttributeButtonRow } from "./CharacterAttributeButtonRow.tsx"
import {
	CharacterEditorDialog,
	CharacterEditorDialogButton,
} from "./CharacterEditorDialog.tsx"
import { CharacterToggleCombatMemberButton } from "./CharacterToggleCombatMemberButton.tsx"
import { CharacterVitalFields } from "./CharacterVitalFields.tsx"

export function CharacterCard({
	character,
}: {
	character: ProtectedCharacter
}) {
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
					<div className="min-h-0">
						<div className="flex flex-col py-2 gap-2">
							{character.full && (
								<CharacterAttributeButtonRow character={character.full} />
							)}
							{character.full && (
								<CharacterVitalFields character={character.full} />
							)}
							{character.full && (
								<CharacterEditorDialog character={character.full}>
									<CharacterEditorDialogButton
										render={
											<Button icon={<Lucide.Edit className="size-5" />}>
												Edit
											</Button>
										}
									></CharacterEditorDialogButton>
								</CharacterEditorDialog>
							)}
							<CharacterToggleCombatMemberButton
								characterIds={[character.public._id]}
							/>
						</div>
					</div>
				</Collapse.Content>
			</Collapse>
		</div>
	)
}
