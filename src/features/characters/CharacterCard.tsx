import * as Lucide from "lucide-react"
import type { Character } from "~/types.ts"
import { Avatar, AvatarFallback, AvatarImage } from "~/ui/avatar.tsx"
import { Button } from "~/ui/button.tsx"
import { Card, CardDescription, CardTitle } from "~/ui/card.tsx"
import { Input } from "~/ui/input.tsx"
import { Label } from "~/ui/label.tsx"

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
					<Lucide.Edit />
				</Button>
			</div>
			<div className="flex gap *:flex-1">
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
				<Button variant="outline">
					<Lucide.BicepsFlexed />
				</Button>
				<Button variant="outline">
					<Lucide.Eye />
				</Button>
				<Button variant="outline">
					<Lucide.Wind />
				</Button>
				<Button variant="outline">
					<Lucide.Lightbulb />
				</Button>
				<Button variant="outline">
					<Lucide.Sparkle />
				</Button>
			</div>
		</Card>
	)
}
