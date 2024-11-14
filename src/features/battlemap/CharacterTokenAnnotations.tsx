import { twMerge } from "tailwind-merge"
import { CharacterName } from "../characters/CharacterName.tsx"
import { getConditionColorClasses } from "../characters/conditions.ts"
import { ApiCharacter } from "../characters/types.ts"
import { Sprite, SpriteProps } from "./Sprite.tsx"

export function CharacterTokenAnnotations({
	character,
	visible,
	statusVisible,
	distanceMoved,
	...props
}: {
	character: ApiCharacter
	visible: boolean
	statusVisible: boolean
	distanceMoved: number
} & SpriteProps) {
	return (
		<Sprite {...props}>
			<Sprite.Attachment
				side="top"
				className={twMerge(
					"p-4 opacity-0 transition-opacity data-[visible=true]:opacity-95",
					props.className,
				)}
				data-visible={visible}
			>
				<Sprite.Badge>
					<p className="text-base/5 empty:hidden">
						<CharacterName character={character} />
					</p>
					<p className="text-sm/5 opacity-80 empty:hidden">
						{[character.race, character.pronouns].filter(Boolean).join(" • ")}
					</p>
				</Sprite.Badge>
			</Sprite.Attachment>
			<Sprite.Attachment
				side="bottom"
				className="items-center p-4 opacity-0 transition-opacity gap-2 data-[visible=true]:opacity-95"
				data-visible={visible || statusVisible}
			>
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
			{distanceMoved >= 2 && (
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="rounded-lg bg-black/75 px-2 py-0.5 text-lg font-medium tabular-nums text-blue-200">
						{Math.round(distanceMoved)}m
					</div>
				</div>
			)}
		</Sprite>
	)
}
