import { ComponentProps, createContext, useContext } from "react"
import { mergeClassProp } from "./helpers.ts"

export function Heading(props: ComponentProps<"h1">) {
	const level = useContext(HeadingLevelContext)
	const Tag = `h${level}`
	return <Tag {...mergeClassProp(props, "text-pretty text-3xl font-light")} />
}

const HeadingLevelContext = createContext(1)
export function HeadingLevel({ children }: { children: React.ReactNode }) {
	const currentLevel = useContext(HeadingLevelContext)
	return (
		<HeadingLevelContext.Provider value={Math.min(currentLevel + 1, 6)}>
			{children}
		</HeadingLevelContext.Provider>
	)
}
