import * as Ariakit from "@ariakit/react"
import * as Lucide from "lucide-react"
import { ComponentProps, startTransition } from "react"
import { match, P } from "ts-pattern"
import { Avatar } from "~/components/Avatar.tsx"
import { Heading, HeadingLevel } from "~/components/Heading.tsx"
import { type ProtectedCharacter } from "~/convex/characters.ts"
import { interactivePanel, panel } from "~/styles/panel.ts"
import { primaryHeading, secondaryHeading } from "~/styles/text.ts"
import { Id } from "../../../convex/_generated/dataModel"
import { Field } from "../../components/Field.tsx"
import { fadeTransition, fadeZoomTransition } from "../../styles/transitions.ts"
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip.tsx"
import { getImageUrl } from "../images/getImageUrl.ts"
import { CharacterEditor } from "./CharacterEditor.tsx"
import { RaceAbilityList } from "./RaceAbilityList.tsx"
import { ApiCharacter } from "./types.ts"

export function CharacterCard({
	character,
	...props
}: {
	character: ProtectedCharacter
} & ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={interactivePanel(
				"group flex w-full min-w-0 items-center p-2 text-start gap-2",
				props.className,
			)}
		>
			<Avatar
				src={character.imageId && getImageUrl(character.imageId)}
				className="size-12"
			/>
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-1.5">
					<Heading className={secondaryHeading("shrink truncate empty:hidden")}>
						{character.identity?.name ?? (
							<span className="opacity-70">(unknown)</span>
						)}
					</Heading>

					<div className="shrink-0 opacity-50 transition-opacity *:size-4 hover:opacity-100">
						<CharacterVisibilityIcon character={character} />
					</div>
				</div>
				<p className="mt-1 text-sm font-semibold leading-none tracking-wide text-primary-300 empty:hidden">
					{[character.race, character.identity?.pronouns]
						.filter(Boolean)
						.join(" • ")}
				</p>
			</div>
		</div>
	)
}

function CharacterVisibilityIcon({ character }: { character: ApiCharacter }) {
	return (
		match(character)
			// viewer is the player of this character
			.with({ isPlayer: true }, () => (
				<Tooltip>
					<TooltipTrigger render={<Lucide.User2 />} />
					<TooltipContent>You are the player of this character.</TooltipContent>
				</Tooltip>
			))
			// public (players can see name and profile)
			.with(
				P.union(
					{ full: { visible: true, nameVisible: true } },
					{ identity: P._ },
				),
				() => (
					<Tooltip>
						<TooltipTrigger render={<Lucide.Globe />} />
						<TooltipContent>
							This character&apos;s name and basic profile are public.
						</TooltipContent>
					</Tooltip>
				),
			)
			// anonymous (players can see profile)
			.with(P._, () => (
				<Tooltip>
					<TooltipTrigger render={<Lucide.VenetianMask />} />
					<TooltipContent>This character&apos;s name is hidden.</TooltipContent>
				</Tooltip>
			))
			// private (not accessible to players)
			// we always show this if the viewer can see this
			// despite all other options not matching
			.otherwise(() => (
				<Tooltip>
					<TooltipTrigger render={<Lucide.Lock />} />
					<TooltipContent>
						This character is private, and can only be seen by room owners.
					</TooltipContent>
				</Tooltip>
			))
	)
}

export function CharacterEditorPopoverCard({
	character,
	open,
	setOpen,
	afterClone,
}: {
	character: ProtectedCharacter
	open: boolean
	setOpen: (value: boolean) => void
	afterClone: (characterId: Id<"characters">) => void
}) {
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
				render={<CharacterCard character={character} />}
			></Ariakit.PopoverDisclosure>

			<Ariakit.Popover
				className={panel(
					"h-screen max-h-[1000px] w-screen max-w-[600px] overflow-y-auto px-2",
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
					<>
						<Heading className={primaryHeading("mt-3 px-2")}>
							{character.full.name}
						</Heading>
						<CharacterEditor
							character={character.full}
							afterClone={afterClone}
						/>
					</>
				) : (
					<div className="flex h-fit max-h-screen flex-col p-gap gap">
						<HeadingLevel>
							<Heading className={primaryHeading()}>
								{character.identity?.name ?? "(unknown)"}
							</Heading>
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
						</HeadingLevel>
					</div>
				)}
			</Ariakit.Popover>
		</Ariakit.PopoverProvider>
	)
}
