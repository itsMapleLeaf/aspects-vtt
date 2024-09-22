import * as Lucide from "lucide-react"
import { Avatar } from "~/components/Avatar.tsx"
import { Button } from "~/components/Button.tsx"
import { Heading } from "~/components/Heading.tsx"
import { NormalizedCharacter } from "~/convex/characters.ts"
import { secondaryHeading } from "~/styles/text.ts"
import { getImageUrl } from "../images/getImageUrl.ts"
import { CharacterAttributeButtonRow } from "./CharacterAttributeButtonRow.tsx"
import {
	CharacterEditorDialog,
	CharacterEditorDialogButton,
} from "./CharacterEditorDialog.tsx"
import { CharacterVitalFields } from "./CharacterVitalFields.tsx"

export function CharacterCard({
	character,
}: {
	character: NormalizedCharacter
}) {
	return (
		<div className={"flex flex-col gap-3"}>
			<div className="flex items-center gap">
				<Avatar
					src={character.imageId ? getImageUrl(character.imageId) : undefined}
					className="size-14"
				/>
				<div>
					<Heading className={secondaryHeading("leading-none")}>
						{character.name}
					</Heading>
					<p className="mt-1 text-sm font-semibold leading-none tracking-wide text-primary-300 empty:hidden">
						{[character.race, character.pronouns].filter(Boolean).join(" • ")}
					</p>
				</div>
				<CharacterEditorDialog character={character}>
					<CharacterEditorDialogButton
						render={
							<Button
								appearance="clear"
								square
								className="ml-auto"
								icon={<Lucide.Edit className="size-5" />}
							/>
						}
					></CharacterEditorDialogButton>
				</CharacterEditorDialog>
			</div>
			<CharacterAttributeButtonRow character={character} />
			<CharacterVitalFields character={character} />
		</div>
	)
}
