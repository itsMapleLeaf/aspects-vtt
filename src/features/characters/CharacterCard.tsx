import * as Ariakit from "@ariakit/react"
import { useConvex } from "convex/react"
import * as Lucide from "lucide-react"
import { startTransition, useState } from "react"
import { Avatar } from "~/components/Avatar.tsx"
import { Heading } from "~/components/Heading.tsx"
import { type ProtectedCharacter } from "~/convex/characters.ts"
import { interactivePanel, panel } from "~/styles/panel.ts"
import { secondaryHeading } from "~/styles/text.ts"
import { Id } from "../../../convex/_generated/dataModel"
import { Field } from "../../components/Field.tsx"
import { fadeTransition, fadeZoomTransition } from "../../styles/transitions.ts"
import { getImageUrl } from "../images/getImageUrl.ts"
import { useRoomContext } from "../rooms/context.tsx"
import { CharacterEditor } from "./CharacterEditor.tsx"
import { RaceAbilityList } from "./RaceAbilityList.tsx"

export function CharacterCard({
	character,
	// open,
	// onOpen,
	// onClose,
	afterClone,
}: {
	character: ProtectedCharacter
	open: boolean
	onOpen: () => void
	onClose: () => void
	afterClone: (characterId: Id<"characters">) => void
}) {
	const room = useRoomContext()
	const convex = useConvex()
	const [open, setOpen] = useState(false)

	return (
		<Ariakit.PopoverProvider
			placement="right"
			open={open}
			setOpen={(open) => {
				startTransition(() => {
					setOpen(open)
				})
			}}
		>
			<Ariakit.PopoverDisclosure
				className={interactivePanel(
					"group flex w-full items-center p-2 text-start gap-2",
				)}
			>
				<Avatar
					src={character.imageId && getImageUrl(character.imageId)}
					className="size-12"
				/>
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-1.5">
						<Heading
							className={secondaryHeading("shrink truncate empty:hidden")}
						>
							{character.identity?.name ?? (
								<span className="opacity-70">(unknown)</span>
							)}
						</Heading>
						{character.full && !character.full.nameVisible && (
							<Lucide.EyeOff className="size-4 shrink-0 opacity-50" />
						)}
						{character.isPlayer && (
							<Lucide.User2 className="size-4 shrink-0 opacity-50" />
						)}
					</div>
					<p className="mt-1 text-sm font-semibold leading-none tracking-wide text-primary-300 empty:hidden">
						{[character.race, character.identity?.pronouns]
							.filter(Boolean)
							.join(" • ")}
					</p>
				</div>
			</Ariakit.PopoverDisclosure>

			<Ariakit.Popover
				className={panel(
					"h-screen max-h-[1000px] w-screen max-w-[540px]",
					fadeZoomTransition(),
				)}
				backdrop={
					<div className={fadeTransition("fixed inset-0 bg-black/25")} />
				}
				gutter={16}
				portal
				unmountOnHide
			>
				{character.full ? (
					<CharacterEditor character={character.full} />
				) : (
					<div>
						<h2>{character.identity?.name ?? "(unknown)"}</h2>
						{character.imageId && (
							<img
								src={getImageUrl(character.imageId)}
								alt=""
								className={panel(
									"min-h-0 flex-1 bg-primary-900 object-contain",
								)}
							/>
						)}
						<div className="grid auto-cols-fr grid-flow-col gap empty:hidden">
							{character.race && <Field label="Race">{character.race}</Field>}
							{character.identity && (
								<Field label="Pronouns">{character.identity.pronouns}</Field>
							)}
						</div>
						{character.race && (
							<Field label="Abilities">
								<RaceAbilityList race={character.race} />
							</Field>
						)}
					</div>
				)}
			</Ariakit.Popover>
		</Ariakit.PopoverProvider>
	)
}
