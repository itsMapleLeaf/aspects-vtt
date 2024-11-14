import { clamp } from "es-toolkit"
import { createContext, use } from "react"

const HeadingContext = createContext(0)

export function HeadingLevel({ children }: { children: React.ReactNode }) {
	const current = use(HeadingContext)
	return (
		<HeadingContext.Provider value={current + 1}>
			{children}
		</HeadingContext.Provider>
	)
}

export function Heading(props: React.HTMLAttributes<HTMLHeadingElement>) {
	const level = use(HeadingContext)
	const Tag = `h${clamp(level, 1, 6)}` as "h1"
	return <Tag {...props} />
}
