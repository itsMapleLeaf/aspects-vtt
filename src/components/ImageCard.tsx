import { ComponentProps, type ReactNode } from "react"
import type { Except } from "type-fest"
import { panel } from "~/styles/panel.ts"
import { secondaryHeading, subText } from "~/styles/text.ts"
import { Heading } from "./Heading.tsx"
import { LoadingIcon } from "./LoadingIcon.tsx"

interface ImageCardProps extends Except<ComponentProps<"article">, "title"> {
	title: ReactNode
	description?: ReactNode
	imageUrl?: string | null
	pending?: boolean
}

export function ImageCard({
	title,
	description,
	imageUrl,
	pending,
	...props
}: ImageCardProps) {
	const DescriptionTag = typeof description === "string" ? "p" : "div"
	return (
		<article
			{...props}
			className={panel(
				"relative flex h-full flex-col items-center justify-center px-4 py-6 text-center",
				props.className,
			)}
		>
			{imageUrl && (
				<img
					src={imageUrl}
					alt=""
					className="absolute inset-0 size-full rounded-[inherit] object-cover brightness-25"
				/>
			)}
			{pending ? (
				<LoadingIcon className="relative" />
			) : (
				<>
					<Heading className={secondaryHeading("drop-shadow-sm")}>
						{title}
					</Heading>
					<DescriptionTag
						className={subText(
							"whitespace-pre-line drop-shadow-sm empty:hidden",
						)}
					>
						{description}
					</DescriptionTag>
				</>
			)}
		</article>
	)
}
