import { twMerge } from "tailwind-merge"
import { CharacterName } from "../characters/CharacterName.tsx"
import { getConditionColorClasses } from "../characters/conditions.ts"
import { ApiCharacter } from "../characters/types.ts"
import { Sprite, SpriteProps } from "./Sprite.tsx"

export function CharacterTokenAnnotations({
	character,
	visible,
	...props
}: {
	character: ApiCharacter
	visible: boolean
} & SpriteProps) {
	return (
		<Sprite
			{...props}
			className={twMerge(
				"opacity-0 transition-opacity will-change-[opacity] data-[visible=true]:opacity-95",
				props.className,
			)}
			data-visible={visible}
		>
			<Sprite.Attachment side="top" className="p-4">
				<Sprite.Badge>
					<p className="text-base/5 empty:hidden">
						<CharacterName character={character} />
					</p>
					<p className="text-sm/5 opacity-80 empty:hidden">
						{[character.race, character.pronouns].filter(Boolean).join(" • ")}
					</p>
				</Sprite.Badge>
			</Sprite.Attachment>
			<Sprite.Attachment side="bottom" className="items-center p-4 gap-2">
				{character.full && (
					<div className="flex max-w-[180px] gap-1">
						<Sprite.Meter
							value={character.full.health}
							max={character.full.healthMax}
							className={{
								root: "border-green-700 bg-green-500/50",
								fill: "bg-green-500",
							}}
						/>
						<Sprite.Meter
							value={character.full.resolve}
							max={character.full.resolveMax}
							className={{
								root: "border-blue-700 bg-blue-500/50",
								fill: "bg-blue-500",
							}}
						/>
					</div>
				)}
				<div className="flex w-64 flex-wrap justify-center gap-1">
					{[...new Set(character.conditions)].map((condition) => (
						<Sprite.Badge
							key={condition}
							className={twMerge(
								"px-2.5 py-1 text-sm leading-4",
								getConditionColorClasses(condition),
							)}
						>
							{condition}
						</Sprite.Badge>
					))}
				</div>
			</Sprite.Attachment>
		</Sprite>
	)
}
