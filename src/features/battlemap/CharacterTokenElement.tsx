import { ComponentProps } from "react"
import { StatefulApiImage } from "~/components/ApiImage.tsx"
import { ApiCharacter } from "../characters/types.ts"
import { BaseTokenElement } from "./BaseTokenElement.tsx"

export function CharacterTokenElement({
	character,
	selected,
	children: _,
	...props
}: {
	character: ApiCharacter
	selected: boolean
} & ComponentProps<typeof BaseTokenElement>) {
	return (
		<>
			<BaseTokenElement {...props}>
				<div className="absolute -inset-1 rounded-full bg-black/50" />
				<div className="absolute -inset-2 rounded-full bg-black/50" />
				<StatefulApiImage
					imageId={character.imageId}
					className="absolute inset-0 size-full rounded-full object-cover object-top"
					draggable={false}
				/>
				{selected && (
					<div className="pointer-events-none absolute -inset-0.5 rounded-full border-2 border-accent-900 bg-accent-600/50 transition-opacity" />
				)}
			</BaseTokenElement>
		</>
	)
}
