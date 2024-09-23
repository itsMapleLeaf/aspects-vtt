import * as Lucide from "lucide-react"
import { Avatar } from "~/components/Avatar.tsx"
import { Button } from "~/components/Button.tsx"
import { Heading } from "~/components/Heading.tsx"
import { type ProtectedCharacter } from "~/convex/characters.ts"
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
	character: ProtectedCharacter
}) {
	return (
		<div className={"flex flex-col gap-3"}>
			<div className="flex items-center gap">
				<Avatar
					src={
						character.public.imageId ?
							getImageUrl(character.public.imageId)
						:	undefined
					}
					className="size-14"
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
				{character.full && (
					<CharacterEditorDialog character={character.full}>
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
				)}
			</div>
			{character.full && (
				<CharacterAttributeButtonRow character={character.full} />
			)}
			{character.full && <CharacterVitalFields character={character.full} />}
		</div>
	)
}
