import * as Lucide from "lucide-react"
import { ComponentProps } from "react"
import { match, P } from "ts-pattern"
import { Avatar } from "~/components/Avatar.tsx"
import { Heading } from "~/components/Heading.tsx"
import { type ProtectedCharacter } from "~/convex/characters.ts"
import { interactivePanel } from "~/styles/panel.ts"
import { secondaryHeading } from "~/styles/text.ts"
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip.tsx"
import { getImageUrl } from "../images/getImageUrl.ts"
import { CharacterName } from "./CharacterName.tsx"
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
				"group flex w-full min-w-0 items-center gap-2 p-2 text-start",
				props.className,
			)}
		>
			<Avatar
				src={character.imageId && getImageUrl(character.imageId)}
				className="size-12"
			/>
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<Heading className={secondaryHeading("shrink truncate empty:hidden")}>
						<CharacterName character={character} />
					</Heading>

					<div className="shrink-0 opacity-50 transition-opacity *:size-4 hover:opacity-100">
						<CharacterVisibilityIcon character={character} />
					</div>
				</div>
				<p className="text-primary-300 mt-1 text-sm leading-none font-semibold tracking-wide empty:hidden">
					{[character.race, character.pronouns].filter(Boolean).join(" • ")}
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
					{ full: P.nullish, name: P.nonNullable },
					{ full: { visible: true, nameVisible: true } },
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
			// anonymous (players can see profile, but not the name)
			.with(
				P.union(
					{ full: P.nullish, name: P.nullish },
					{ full: { visible: true, nameVisible: false } },
				),
				() => (
					<Tooltip>
						<TooltipTrigger render={<Lucide.VenetianMask />} />
						<TooltipContent>
							This character&apos;s name is hidden.
						</TooltipContent>
					</Tooltip>
				),
			)
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
