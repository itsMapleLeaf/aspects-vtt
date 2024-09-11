import { startCase } from "lodash-es"
import * as Lucide from "lucide-react"
import type { Character } from "~/types.ts"
import { Avatar, AvatarFallback, AvatarImage } from "~/ui/avatar.tsx"
import { Button } from "~/ui/button.tsx"
import { Card, CardDescription, CardTitle } from "~/ui/card.tsx"
import { Input } from "~/ui/input.tsx"
import { Label } from "~/ui/label.tsx"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/ui/tooltip.tsx"

export function CharacterCard({ character }: { character: Character }) {
	return (
		<Card className="flex flex-col p-3 gap-3">
			<div className="flex items-center gap">
				<Avatar className="size-14">
					<AvatarImage
						src={character.imageUrl ?? undefined}
						className="object-cover object-top"
					/>
					<AvatarFallback>{character.name[0]}</AvatarFallback>
				</Avatar>
				<div>
					<CardTitle>{character.name}</CardTitle>
					<CardDescription>
						{[character.race, character.pronouns].filter(Boolean).join(" • ")}
					</CardDescription>
				</div>
				<Button variant="ghost" className="ml-auto" size="icon">
					<Lucide.Edit className="size-5" />
				</Button>
			</div>
			<div className="flex gap *:min-w-0 *:flex-1">
				<div className="flex flex-col gap-0.5">
					<Label>Health</Label>
					<Input />
				</div>
				<div className="flex flex-col gap-0.5">
					<Label>Resolve</Label>
					<Input />
				</div>
			</div>
			<div className="flex items-center gap">
				<AttributeButton attribute="strength" icon={<Lucide.BicepsFlexed />} />
				<AttributeButton attribute="sense" icon={<Lucide.Eye />} />
				<AttributeButton attribute="mobility" icon={<Lucide.Wind />} />
				<AttributeButton attribute="intellect" icon={<Lucide.Lightbulb />} />
				<AttributeButton attribute="wit" icon={<Lucide.Sparkle />} />
			</div>
		</Card>
	)
}

function AttributeButton({
	attribute,
	icon,
}: {
	attribute: keyof NonNullable<Character["attributes"]>
	icon: React.ReactNode
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button variant="ghost" size="icon" className="*:size-5">
					{icon}
				</Button>
			</TooltipTrigger>
			<TooltipContent side="bottom">{startCase(attribute)}</TooltipContent>
		</Tooltip>
	)
}
