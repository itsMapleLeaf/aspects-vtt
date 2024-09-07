import { LucideUser } from "lucide-react"
import { twMerge } from "tailwind-merge"

interface CharacterAvatarProps extends React.ComponentProps<"div"> {
	character: {
		imageUrl: string | null
	}
}

export function CharacterAvatar({ character, ...props }: CharacterAvatarProps) {
	return (
		<div
			{...props}
			data-missing={character.imageUrl == null || undefined}
			className={twMerge(
				"grid size-16 place-items-center rounded-full bg-cover bg-center outline-1 outline-primary-600 data-[missing]:bg-primary-700 data-[missing]:outline",
				props.className,
			)}
			style={{
				backgroundImage:
					character.imageUrl ? `url(${character.imageUrl})` : undefined,
			}}
		>
			{character.imageUrl == null && <LucideUser className="size-3/4" />}
		</div>
	)
}
