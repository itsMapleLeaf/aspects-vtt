import { createContext, useContext, type ComponentProps } from "react"

const HeadingContext = createContext(0)

export function HeadingLevel({ children }: { children: React.ReactNode }) {
	const level = useContext(HeadingContext)
	return (
		<HeadingContext.Provider value={level + 1}>
			{children}
		</HeadingContext.Provider>
	)
}

export function Heading({
	children,
	...props
}: { children: React.ReactNode } & ComponentProps<"h1">) {
	const level = useContext(HeadingContext)
	const Tag = `h${Math.min(6, level)}`
	return <Tag {...props}>{children}</Tag>
}
