import { ComponentProps, type ReactNode } from "react"
import { StrictOmit } from "~/common/types.ts"
import { lightPanel } from "~/styles/panel.ts"
import { secondaryHeading, subText } from "../styles/text"
import { Heading } from "./Heading"

interface ListCardProps extends StrictOmit<ComponentProps<"article">, "title"> {
	title?: ReactNode
	description?: ReactNode
	aside?: ReactNode
}

export function ListCard({
	title,
	description,
	aside,
	...props
}: ListCardProps) {
	return (
		<article
			{...props}
			className={lightPanel(
				"flex w-full flex-col p-2 text-left gap-1.5",
				props.className,
			)}
		>
			<Heading className={secondaryHeading()}>{title}</Heading>
			<p className="-mb-0.5 -mt-1 leading-snug empty:hidden">{description}</p>
			<aside className={subText("italic empty:hidden")}>{aside}</aside>
		</article>
	)
}
